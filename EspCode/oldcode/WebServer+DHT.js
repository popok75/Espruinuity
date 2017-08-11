var dht ;
var tempsensor="init";
var humsensor="init";

var fonthuge="<font size=\"46\">";
var fontbig="<font size=\"24\">";
var fontmed="<font size=\"12\">";

var relaystate=0;

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

function getPage(a ) {
    var htmlReading=getHtmlReading();
	var ret="<html><meta http-equiv=\"refresh\" content=\"5\" ><body>";
	ret+="<p> Espruino : <br><big>"+htmlReading+"</big></p>";
	ret+=' <p> Relay is '+fonthuge+(relaystate?'on':'off')+"</font>  change to state "
			+fonthuge+(relaystate?'<a href="?command=0">off</a>':' <a href="?command=1">on</a>')+"</font";
	ret+="</body><html>";
	
	
	return ret;
}


function onPageRequest(req, res) {
	
	 var a = url.parse(req.url, true);
     res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(getPage(a));

  if (a.query && "command" in a.query) {
		relaystate=a.query["command"];
		digitalWrite(D2, !relaystate);
	}
	
	
	
//  console.log("Serving request");
  res.writeHead(200);

  res.end(getPage());
}
DHTConnect();

setInterval("DHTRead();",500);

var http = require("http");
 
http.createServer(onPageRequest).listen(8080);