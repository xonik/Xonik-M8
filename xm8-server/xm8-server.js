/*
Xonik M8 ws & http server

Go to http://pi_address/
*/

var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var eventbus = require('./synthcore/eventbus.js');

var controllers = require('./synthcore/controllers.js');
var ctrlSetup = require('./shared/controllerSetup.js');
var spiRepository = require('./synthcore/spiRepository.js');

function publishControllerChange(message){
  var msgParts = message.split(',');
  var id = msgParts[0];
  var type = ctrlSetup.srv[id].type;
  var value = msgParts[1];

  eventbus.controls.emit("controller", {type: type, source: "gui", id: id, value: value});
  
  console.log("Published event from GUI: " + id + " to " + value);
}

function listenToControllerChanges(){
  eventbus.controls.on("controller",function(event){
    if(event.source !== "gui"){
      console.log("Received event from " + event.source);
      sendController("" + event.id + "," + event.value);
    }
  });
}

function sendController(message){
  console.log("Trying to send controller " + message + " to gui");

  //todo: move this out of function?
  var wss = expressWs.getWss('/controller');
  wss.clients.forEach(function (client) {

    try{
      console.log("Sending message " + message + " to gui " + client);
      client.send(message);
    } catch (ex){
      console.log("Client went missing before server could send message");
    }
  });   
}

app.use(function (req, res, next) {
  //console.log('middleware accessed through ' + req);
  req.testing = 'testing';
  return next();
});

app.use(express.static('static'));

app.get('/', function (req, res) {
  console.log("Redirecting to start page");
  res.redirect("/xm8-gui.html");
});

/*
app.ws('/echo', function(ws, req) {
  console.log("Something connected to echo resource");
  ws.on('message', function(msg) {
    console.log("message received");
    publishControllerChange(msg);

    var aWebSocketService = expressWs.getWss('/echo');
    aWebSocketService.clients.forEach(function (client) {
      try{
        console.log("Resending " + msg);
        client.send(msg);
      } catch (ex){
        console.log("Client not available");
      }
    });    
  });
});*/
 
app.ws('/controller', function(ws, req) {
  console.log("Something connected to controller");

  ws.on('message', function(msg) {
    publishControllerChange(msg);
  });
});

app.listen(3000);
listenToControllerChanges();