var mqtt = require('mqtt'); //includes mqtt server 
var mongodb = require('mongodb'); // includes mongoDB 
var mongodbClient = mongodb.MongoClient; //initialises the mongoDB client
var mongodbURI = 'mongodb://localhost:27017/test'; //activating the MongoDB port 27017, here TempMontor is the name of the database
var collection,client; //initialise collection and client
var NUM_SAMPLE_FOR_AVG = 5, numSample = 0, tempCelcius = 0, currentAvg = 0;


mongodbClient.connect(mongodbURI, setupCollection); //connect the database with collecion
console.log("mongodbURI : ", mongodbURI)     
function setupCollection(err, db) {
   if(err) throw err;
   collection=db.collection("result"); //name of the collection in the database
   client=mqtt.connect('mqtt://test.mosquitto.org:1883'); //connecting the mqtt server with the MongoDB database
   client.subscribe("tempMeasurement"); //subscribing to the topic name 
   client.on('message', insertEvent); //inserting the event   
}

//function that displays the data in the MongoDataBase
function insertEvent(topic,payload) {

   if (topic.toString() == "tempMeasurement") {  
   
      var sensorMeasurement=JSON.parse(payload);
      console.log("sensorMeasurement : ", sensorMeasurement)
      console.log("NUM_SAMPLE_FOR_AVG : ", NUM_SAMPLE_FOR_AVG)
      if (numSample <= NUM_SAMPLE_FOR_AVG) {
         numSample = numSample + 1;
         if (sensorMeasurement.unitOfMeasurement == 'F') {
            tempCelcius = ((sensorMeasurement.tempValue - 32) * (5 / 9));
         } else {
            tempCelcius = sensorMeasurement.tempValue;
         }
         currentAvg = parseFloat(currentAvg) + parseFloat(tempCelcius);
         if (numSample == NUM_SAMPLE_FOR_AVG) {
            currentAvg = currentAvg / NUM_SAMPLE_FOR_AVG;
            var avgTemp = {
               "tempValue" : parseFloat(currentAvg),
               "unitOfMeasurement" : sensorMeasurement.unitOfMeasurement
            };
            client.publish('roomAvgTempMeasurement', JSON   
                  .stringify(avgTemp));

            console.log("console : Publishing Data roomAvgTempMeasurement, Avg Temp in simulation lab is "+currentAvg);  
            // Insert into MongoDB
            collection.insert({type :'tempMeasurement', avgTemp : avgTemp, sensorData : sensorMeasurement})
            numSample = 0;
            currentAvg = 0;
         }
      }
   }  




   console.log("topic : ", topic)
   console.log("payload : ", payload)
   // collection.insert(payload,   function(err,docs) {  
   //    if(err) {
   //       console.log("Insert fail")// Improve error handling		
   // 	 }else {
   //       console.log("res: ", docs)
   //     }
   //  })
}