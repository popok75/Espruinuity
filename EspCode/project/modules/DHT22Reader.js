
require("DHT22");
 
 function DHT22Reader(npin){
	 this.pin=npin;
	this.readDHT22 = function (cback){
			 console.log("reading");
			 var dht = require("DHT22").connect(NodeMCU.D4);
			 dht.read(function (a){
			 console.log("Temperature is "+a.temp.toString());
			 console.log("Humidity is "+a.rh.toString());
			 cback(a);
			 });
 }
 }
exports = DHT22Reader;

 
