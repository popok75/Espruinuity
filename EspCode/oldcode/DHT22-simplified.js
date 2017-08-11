

 
function dhtreader (a) {
  console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());
}

 
var    mod = require("DHT22");
var    dht = mod.connect(NodeMCU.D2);
var    dhtread = dhtreader;
dht.read(dhtread);
 

