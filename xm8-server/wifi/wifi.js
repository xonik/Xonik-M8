// TODO: Fjerne de doble begrepene ESSID og ssid, det blir bare kaos. F�r lage mindre generell wpa_supplicant.conf-saving isteden.
// TODO: Store mac, retry without if not available

var exec = require('child_process').exec;
var jsonfile = require('jsonfile');
var fs = require('fs');
var display = require('../synthcore/display.js');
var _ = require('lodash');
var config = require('../synthcore/config.js');

var persistedNetsFile = 'wifi/persisted_nets.json';
var wpaSupplicantFile = '/etc/wpa_supplicant/wpa_supplicant.conf';

var detectedNets = [];
var knownNets = [];


function connectToNet(ssid, success, failure){
  listNetworks()
    .then(getNetworkBySsid.bind(null, ssid))
    .then(generateWpaSupplicantConf)
    .then(connect.bind(null, ssid))
    .then(success)
    .catch(function(err){
      console.log("Could not connect to network. Error is:");
      console.log(err);
      display.write(0, 0, "Could not connect to network, trying ad-hoc");
      connectToAdHoc(success, failure);
    });
}

function connectToKnownNets(success, failure){
  listNetworks()
    .then(generateWpaSupplicantConf.bind(null, knownNets))
    .then(connect)
    .then(success)
    .catch(function(err){
      display.write(0, 0, "Could not connect to network, trying ad-hoc");
      startAdHoc()
        .then(success)
        .catch(function(err){
          console.log(err);
          display.write(0, 0, "Could not set up ad-hoc, gui is inaccessible over wifi");
        });
    });  
}


function connectToAdHoc(success, failure){
  var connectedNet = {ssid: config.wifi.adHoc.ssid};
  
  shutdownAdapter()
    .then(removeDhcpEntry)
    .then(terminateWpaSupplicant)
    .then(setWlanModeToAdHoc)
    .then(setWifiKey.bind(null, config.wifi.adHoc.key))
    .then(setWifiEssid.bind(null, config.wifi.adHoc.ssid))
    .then(setWifiIp.bind(null, config.wifi.adHoc.ip, config.wifi.adHoc.netmask))
    .then(delay.bind(null, 500))
    .then(startAdapter)
    .then(runIfconfig)
    .then(findIP)
    .then(function(foundIp){
      // store connected ip for later
      connectedNet.ip = foundIp;
      return acceptConnection(connectedNet, false);
    })
    .then(success)
    .catch(function(err){
      failure(err);
    });
}

function connect(ssid){

    var connectedNet = {};

    return shutdownAdapter()
      .then(removeDhcpEntry)
      .then(terminateWpaSupplicant)
      .then(startWpaSupplicant)
      .then(setWlanModeToManaged)
      .then(startAdapter)

      // The ssid check could have been done right after startWpaSupplicant, but 
      // it seems that connection to the wifi continues even after that command
      // returns. To save time, we execute the next commands before checing if we 
      // actually have a valid conncetion.
      .then(waitForSsid.bind(null, ssid))
      .then(function(foundSsid){
        // store connected ssid for later
        connectedNet.ssid = foundSsid;
        return checkSsid(ssid, foundSsid);
      })
      .then(generateDhcpEntry)
      .then(runIfconfig)
      .then(findIP)
      .then(function(foundIp){
        // store connected ip for later
        connectedNet.ip = foundIp;
        return acceptConnection(connectedNet, true);
      });
}

function acceptConnection(connectedNet, addToKnown){
  return new Promise(function(resolve, reject){    
    display.write(0, 0, "I'm at " + connectedNet.ip + " on " + connectedNet.ssid);   
    if(addToKnown){
      addToKnownIfNew(connectedNet);
    }
    resolve(connectedNet);
  });
}

function addToKnownIfNew(net){
  if(!isInKnownNets(net)){
    console.log("Network " +net.ssid + " is not in list of known networks, adding it");
    addNetToKnown(net.ssid, net.psk);
  }
}

function isInKnownNets(net){
  return findNetInList(net.ssid, knownNets);
}

function addNetToKnown(ssid, psk){
  knownNets.push({
    keysToInclude: ['ssid', 'psk'], // keys to include when writing wpa_supplicant file
    ssid: ssid, 
    psk: psk
  });
  persistNets(); 
}

function persistNets(){
  jsonfile.writeFile(persistedNetsFile, knownNets, function(err){
    if(err){
      console.log("Error while persisting nets:");
      console.log(err);
    } else {
      console.log("Network list saved to disk");
    }
  });
}

// checkSsid will return positive if no expeced ssid.
function checkSsid(expectedssid, ssid){
  return new Promise(function(resolve, reject){    
    if(expectedssid === ssid || !expectedssid){
      console.log("Found correct ssid: " + ssid);
      resolve(ssid);
    } else {
      console.log("Connected to the wrong ssid: " + ssid);
      reject({message: "Connected to wrong ssid"});
    }
  });
}

function waitForSsid(ssid, retry) {
  // first try doesn't count as retry, initialize with zero
  retry || (retry = 0);

  return getWpaCliStatus()
    .then(findSsid)
    .catch(function (err) {
      if (retry >= config.wifi.ssidRetry.max){
        console.log("checking failed");
        throw err;
      }
      // wait some time and try again
      return delay(config.wifi.ssidRetry.delayMs).then(waitForSsid.bind(null, ssid, ++retry));
    });
}

function findSsid(stdout){
  return new Promise(function(resolve, reject){
    if(stdout){
      // find first ip after block start
      var searchResult = /^ssid=(.*)$/gm.exec(stdout);
      if(searchResult && searchResult.length > 1){
        console.log("Found ssid: " + searchResult[1]);
        resolve(searchResult[1]);
        return;
      }
    }
    console.log("No ssid found");
    reject({message: "No ssid found"});
  });
}

function findIP(stdout){
  var promise = new Promise(function(resolve, reject){
    if(stdout){
      var blockStart = stdout.search(config.wifi.adapter);
      if(blockStart > -1){
        var block = stdout.substr(blockStart);

        // find first ip after block start
        var searchResult = /^\s+inet addr:([0-9\.]+).*$/gm.exec(block);
        if(searchResult && searchResult.length > 1){
          console.log("Found IP " + searchResult[1]);
          resolve(searchResult[1]);
          return;
        }
      }
    }
    console.log("No IP address found");
    reject({message: "No IP address found"})   
  });
  return promise;
}

function shutdownAdapter(){
  return execAsPromise(
    "ifconfig " + config.wifi.adapter + " down",
    "Bringing down " + config.wifi.adapter,
    "Could not shutdown " + config.wifi.adapter);
}

function removeDhcpEntry(){
  return execAsPromise(
    "dhclient -r " + config.wifi.adapter,
    "Removing dhcp entry",
    "Could not remove dhcp entry");
}

function terminateWpaSupplicant(){
  return execAsPromise(
    "wpa_cli terminate",
    "Terminating old wpa_supplicant instance",    
    "wpa_supplicant probably terminated, continuing",
    true); //ignore errors and continue

   //TODO: Check that no wpa process is running.
}

function startWpaSupplicant(){
  return execAsPromise(
    "wpa_supplicant -B -Dwext -i" + config.wifi.adapter + " -c" + wpaSupplicantFile,
    "Starting wpa_supplicant",
    "Could not start wpa_supplicant");
}

// TODO: Merge these
function setWlanModeToManaged(){
  return execAsPromise(
    "iwconfig " + config.wifi.adapter + " mode Managed",
    "Setting wlan mode to managed",
    "Could not set wlan mode to managed");
}

function setWlanModeToAdHoc(){
  return execAsPromise(
    "iwconfig " + config.wifi.adapter + " mode ad-hoc",
    "Setting wlan mode to ad-hoc",
    "Could not set wlan mode to ad-hoc");
}

function startAdapter(){
  return execAsPromise(
    "ifconfig " + config.wifi.adapter + " up", 
    "Bringing up adapter",    
    "Could not bring up adapter");
}

function generateDhcpEntry(){
  return execAsPromise(
    "dhclient " + config.wifi.adapter,
    "Generating dhcp entry",
    "Could not generate dhcp entry");
}

function setWifiKey(key){
  return execAsPromise(
    "iwconfig " + config.wifi.adapter + " key " + key,
    "Setting wifi key",    
    "Could not set wifi key");
}

function setWifiEssid(ssid){
  return execAsPromise(  
    "iwconfig " + config.wifi.adapter + " essid " + ssid,
    "Setting wifi essid",
    "Could not set wifi essid");
}

function setWifiIp(ip, netmask){
  return execAsPromise(
    "ifconfig " + config.wifi.adapter + " " + ip + " netmask " + netmask,
    "Setting wifi ip and netmask",    
    "Could not set wifi ip and netmask");
}

function getWpaCliStatus(){
  return execAsPromise(
    "wpa_cli status",
    "Checking wpa cli status",
    "Checking wpa cli status failed");
}

function runIfconfig(ssid){
  return execAsPromise(
    "ifconfig",
    "Capturing ifconfig output",
    "Could not capture ifconfig output");
}

function scanForNetworks(){
  return execAsPromise(
    "iwlist " + config.wifi.adapter + " scan",
    "Scanning for available wifi networks",
    "Could not scan for available wifi networks");
}

function execAsPromise(command, logMsg, errorMsg, ignoreError){
   var promise = new Promise(function(resolve, reject){
    console.log(logMsg);
    exec(command, function (error, stdout, stderr){
      if(!error || ignoreError){
        console.log("Command succeded");
        console.log(stdout);
        resolve(stdout);
      } else {
        console.log("Command failed");
        console.log(stderr);
        reject({message: errorMsg, stdout: stdout, stderr: stderr, error: error});
      }
    });
  });
  return promise; 
}

function delay(ms){
  return new Promise(function(resolve, reject){
    setTimeout(resolve, ms);
  });
}

function generateWpaSupplicantConf(nets){

  // it is possible to send a single net instead of an array. In that
  // case it must be converted to an array
  if( Object.prototype.toString.call( nets ) !== '[object Array]' ) {
    console.log("Looking for a single net, creating array");
    nets = [nets];
  } 
  
  var promise = new Promise(function(resolve, reject){
    var fileContent = 
      "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n" +
      "fast_reauth=1\n" +
      "#Priority: Higher number seems to take presedence\n";

    for (var i = 0; i < nets.length; i++) {

      var net = nets[i];
      fileContent += 'network={\n';

      // keys to include for this particular network
      _.forEach(net.keysToInclude, function(key){
        // TODO: CHECK EXCISTENCE OF KEY HERE.
        var value = escapeValueIfNecessary(key, net[key]);
        console.log(key + ": " + net[key] + " was replaced with " + value);
        fileContent +='  ' + key + '=' + value + '\n';
      });
   
      // default content to include for all nets 
      var priority = nets.length - i;
      fileContent +=
        '  scan_ssid=1\n' + // makes it possible to connect even if network ssid is not broadcast
        '  priority=' + priority + '\n' +
        '}\n';
    }

    fs.writeFile(wpaSupplicantFile, fileContent, function(err) {
      if(err) {
        console.log(err);
        reject({message: "Could not generate wpa_supplicant.conf"});
      } else {
        console.log("Wpa supplicant config saved.");
        resolve();
      }
    });      
  });
  return promise;    
}

function escapeValueIfNecessary(key, value){
  if(key === 'ssid' || key === 'psk'){
    return '"' + value + '"';
  } 
  return value;
}

function getNetworkBySsid(ssid, detectedNets){
  return new Promise(function(resolve, reject){  
    var selectedNet = findNetInList(ssid, detectedNets);
    if(selectedNet){
      console.log("Found net");
      resolve(selectedNet);
    } else {
      console.log("Could not find net");
      reject({message: "Requested network is not available anymore, maybe it was turned off"});
    }
  });
}

function findNetInList(ssid, nets){
  return _.find(nets, function(o) { return o.ssid === ssid});
}

// lists all available networks along with their status.
function listNetworks(){
  if(detectedNets.length == 0){
    console.log("no nets detected, doing a re-scan");    
    return scanForNetworks()
      .then(extractNetworks)
      .then(mergeDetectedWithKnown)
    // todo: merge with stored nets etc    
  } else {
    return new Promise(function(resolve, reject){
      resolve({detectedNets});
    });
  }
}

function extractNetworks(stdout){
  return new Promise(function(resolve, reject){
    var nets = [];

    var netsAsText = stdout.split("Cell");
    if(netsAsText.length < 2){
      return;
    }

    // iterating in the normal way because we want to start on index 1.
    for(var i = 1; i<netsAsText.length; i++){ 
      var lines = netsAsText[i].split("\n");
      var index = lines[0].match(/^\s*[0-9]+/g)[0].trim();
      var detectedNet = {
        Index: index
      }
      nets.push(detectedNet);

      // remove index from first line
      lines[0] = lines[0].split(" - ")[1];

      // default number of indents, is used for detecting when an IE block ends
      var defaultIndent = lines[1].match(/^\s+/g);
      var ieBlock; // NOT internet explorer but some wifi stuff
      var inIEBlock = false;

      _.forEach(lines, function(line){

        var indentMatch = line.match(/^\s+/g);
        if(indentMatch){
          var indent = indentMatch[0].length;
        }
        line = line.trim();

        if(line.startsWith('Quality')){
          addSignalInfo(line, detectedNet);
        }

        var splitPos = line.search(":");
        if(splitPos > -1){
          var key = line.substr(0, splitPos).trim().replace(/\s/g, '_');
          var value = line.substr(splitPos + 1).trim().replace(/\"/g, '');
       
          // we want to rename some of the keys, for example ESSID
          var key = replaceExtractedKey(key);

          // start new IE block if key is IE. 
          if(key === 'IE'){
            inIEBlock = true;
            ieBlock = {type: value}
            if(!detectedNet["IE"]){
              detectedNet["IE"] = [];
            } 
            detectedNet["IE"].push(ieBlock);
          } else {
            // detect when IE block ends.
            if(inIEBlock && indent === defaultIndent){
              inIEBlock = false; 
            }

            if(inIEBlock){
              ieBlock[key] = value;
            } else {
              detectedNet[key] = value;
            }
          }
        }
      });
    };

    // save globaly
    detectedNets = nets;

    resolve(nets);
  });  
}

function replaceExtractedKey(key){
  switch(key){
    case 'ESSID':
      return 'ssid';
    default:
      return key;
  }
}

function mergeDetectedWithKnown(detectedNets){
  return new Promise(function(resolve, reject){
    _.forEach(detectedNets, function(detectedNet){

      detectedNet.keysToInclude=['ssid', 'psk'];

      var knownNet = findNetInList(detectedNet.ssid, knownNets);
      console.log(detectedNet.ssid);
      if(knownNet){
        detectedNet.isKnown = true;
        _.extend(detectedNet, knownNet);
      } 
    });

    resolve(detectedNets);
  });
}

function getDetectedNets(){
  return new Promise(function(resolve, reject){
    if(detectedNets.length == 0){
      return listNetworks()
    }
  });
}

function scan(success, error){
  exec("iwlist " + config.wifi.adapter + " scan", function(err, stdout, stderr){
    if(err){
      error(stderr);
    }

    // reset list of detected nets
    detectedNets = [];

    var nets = stdout.split("Cell");
    if(nets.length < 2){
      return;
    }

    // iterating in the normal way because we want to start on index 1.
    for(var i = 1; i<nets.length; i++){ 
      var lines = nets[i].split("\n");
      var index = lines[0].match(/^\s*[0-9]+/g)[0].trim();
      var detectedNet = {
        Index: index
      }
      detectedNets.push(detectedNet);

      // remove index from first line
      lines[0] = lines[0].split(" - ")[1];

      // default number of indents, is used for detecting when an IE block ends
      var defaultIndent = lines[1].match(/^\s+/g);
      var ieBlock; // NOT internet explorer but some wifi stuff
      var inIEBlock = false;

      _.forEach(lines, function(line){

        var indentMatch = line.match(/^\s+/g);
        if(indentMatch){
          var indent = indentMatch[0].length;
        }
        line = line.trim();

        if(line.startsWith('Quality')){
          addSignalInfo(line, detectedNet);
        }

        var splitPos = line.search(":");
        if(splitPos > -1){
          var key = line.substr(0, splitPos).trim().replace(/\s/g, '_');
          var value = line.substr(splitPos + 1).trim().replace(/\"/g, '');
       
          // start new IE block if key is IE. 
          if(key === 'IE'){
            inIEBlock = true;
            ieBlock = {type: value}
            if(!detectedNet["IE"]){
              detectedNet["IE"] = [];
            } 
            detectedNet["IE"].push(ieBlock);
          } else {
            // detect when IE block ends.
            if(inIEBlock && indent === defaultIndent){
              inIEBlock = false; 
            }

            if(inIEBlock){
              ieBlock[key] = value;
            } else {
              detectedNet[key] = value;
            }
          }
        }
      });
    };

    success(detectedNets);
  });
}

function addSignalInfo(line, net){

  _.forEach(line.split('  '), function(part){

    if(part.search(":") > -1 ){
      var keyVal = part.split(":");
    } else if (part.search("=") > -1){
      var keyVal = part.split("=");
    }

    var key = keyVal[0].replace(/\s/g,'_');
    var value = keyVal[1];
    if(value.search("/") > -1){
      value = value.split("/")[0].trim();
    }
    net[key] = value; 
  });
}


function loadPersistedNets(success){
  console.log("Going to load persisted networks");
  jsonfile.readFile(persistedNetsFile, function(err, obj){
    if(err){
      console.log("Could not load persisted networks");
      console.log(err);
      knownNets = {};
    } else {
      knownNets = obj;
      console.log("Loaded persisted networks");
      console.log(knownNets);
      if(success) success();
    }
  });
}

/*
function debugCreateNetworks(){
  addNetToKnown('"Poly"', '"jupiter8prophet5"');
  addNetToKnown('"Mono"', '"prophet5jupiter8"');
}

function debugExecuteCommand(){
  var cmd;

  // print process.argv
  process.argv.forEach(function (val, index, array) {
    if(index == 2) cmd = val;
  });

  if(cmd == "1"){
    selectNetAndConnect(knownNets[0]);
  } else if(cmd == "2"){
    selectNetAndConnect(knownNets[1]);
  } else if(cmd == "3"){
    connectToKnownNets();
  } else if(cmd == "4"){
    startAdHoc();
  } else if(cmd == "create"){
    debugCreateNetworks();
  }
}

function debugRun(){

  // load all known nets from disk - has to be done elsewhere later
  loadPersistedNets(debugExecuteCommand);
}

debugRun();
*/

loadPersistedNets();
/*
root@raspberrypi:~# iwconfig wlan0 mode managed 
Error for wireless request "Set Mode" (8B06) :
    SET failed on device wlan0 ; Operation not permitted.

løsning: starte wpa_supplicant, fjernet problemet
*/

module.exports.listNetworks = listNetworks;
module.exports.connectToNet = connectToNet;
module.exports.connectToAdHoc = connectToAdHoc;
module.exports.connectToKnownNets = connectToKnownNets;
