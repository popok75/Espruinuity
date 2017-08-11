var dht = require("DHT22").connect(NodeMCU.D4);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});