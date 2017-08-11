var dht ;

function DHTConnect() {
   mod = require("DHT22");
   dht = mod.connect(NodeMCU.D2);
}
function dhtreader (a) {
  console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());
}

function DHTRead() {
  var dhtread = dhtreader;
  dht.read(dhtread);
}

DHTConnect();
DHTRead();
