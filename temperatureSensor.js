var mqtt=require('mqtt');
var client=mqtt.connect('mqtt://test.mosquitto.org:1883');

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

setInterval(function(){
	var value={"tempValue":randomInt(25,40),"unitOfMeasurement":"C","humidityValue":randomInt(50,70)};
	client.publish('tempMeasurement',JSON.stringify(value));	
	console.log("Publishing Temperature Measurements");
},5000);

