var dht ;
var tempsensor="init";
var humsensor="init";

var fonthuge="<font size=\"46\">";
var fontbig="<font size=\"24\">";
var fontmed="<font size=\"12\">";

function DHTConnect() {
   mod = require("DHT22");
   dht = mod.connect(NodeMCU.D2);
}

function dhtreader (a) {
 tempsensor=a.temp;
  humsensor=a.rh;
  //tempsensor=a.temp.toString();
}

function DHTRead() {
  var dhtread = dhtreader;
  dht.read(dhtread);
 // console.log("reading");
}

function getHtmlReading() {

	return "Temperature :"+fonthuge+tempsensor.toString()+"°C</font> <br> RH: "+fontbig+humsensor.toString()+"%</font>";
}

function getPage() {
  var htmlReading=getHtmlReading();
	return "<html><meta http-equiv=\"refresh\" content=\"5\" >Espruino : <br><big>"+htmlReading+"<html></big>";
}

DHTConnect();

setInterval("DHTRead();",500);

var http = require("http");
 
http.createServer(function (req, res) {
//  console.log("Serving request");
  res.writeHead(200);

  res.end(getPage());
}).listen(8080);