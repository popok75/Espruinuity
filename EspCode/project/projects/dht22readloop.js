require("DHT22");
 
setInterval(function() {
 var dht = require("DHT22").connect(NodeMCU.D4);
 dht.read(function (a){
 console.log("Temperature is "+a.temp.toString());
 console.log("Humidity is "+a.rh.toString());
 });
}, 3000);

