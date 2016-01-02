// the spi repository serializes, sends and receives data through the SPI bus. 
// It communicates through events and exports nothing.

var eventbus = require('./eventbus.js');
//var spi = require('./spi.js');
var config = require('./config.js');
var ctrlConfig = require('../shared/controllerSetup.js');
var types = require('../shared/datatypes.js');

function publishControllerChange(buffer){
  var event = fromSpiBuffer(buffer);

  if(event.type === types.CTRL_8_BIT || event.type === types.CTRL_16_BIT){
    eventbus.controls.emit("controller", event);
    console.log("Published event from SPI: " + event.id + " to " + event.value);    
  }
}

function listenToControllerChanges(){
  eventbus.controls.on("controller",function(event){
    if(event.source !== "spi"){
      sendController(toSpiBuffer(event));
    }
  });
}

function fromSpiBuffer(buffer){
  var controller = ctrlConfig.hw[buffer[0]]; 
  var type = controller.type;
  var id = controller.srvId;
  var value = getValueFromSpi(type, buffer);
  console.log("Converted spi buffer - type: " + type + ", id: " + id + ", value: " + value);
  return {source: "spi", type: type, id: id, value: value};
}

function getValueFromSpi(type, buffer){
  if(type === types.CTRL_8_BIT){
    return buffer[1];
  } else if(type === types.CTRL_16_BIT){
    return buffer[1] + buffer[2] * 256;
  }
}

function toSpiBuffer(event){
  var controller = ctrlConfig.srv[event.id];
  var type = controller.type;
  var id = controller.hwId;
  switch(type){
    case types.CTRL_8_BIT:
      return new Buffer([id, event.value]); 
    case types.CTRL_16_BIT:
      return new Buffer([id, event.value, event.value / 256 ]); 
    default:
      return 0; 
  }
}

function sendController(buffer){
  if(config.spi.loopback){
    console.log("SPI loopback, resending");
    for(var i = 0; i<buffer.length; i++){
      console.log(buffer[i]);
    }    
    publishControllerChange(buffer);  	
  } else {
  	//spi.write(buffer);
  }
}

function receive(buffer){
	//Todo - implement multiple types here. For now controller messages are the only ones.
	publishControllerChange(buffer);
}

listenToControllerChanges();
//spi.setReceiveCallback(receive);