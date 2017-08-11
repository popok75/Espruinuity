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
	var ret="<html>";
      console.log("a:"+a);
	if (a===true){
      ret+='<meta http-equiv="refresh" content="0; url="/" />';
      console.log("back to homepage:"+a);
    }
	else{
      ret+='<meta http-equiv="refresh" content="5" >';
      console.log("refresh"+a);
    }
	ret+="<body>";
	ret+="<p> Espruino : <br><big>"+htmlReading+"</big></p>";
	ret+=' <p><big> Relay is '+fonthuge+(relaystate?'on':'off')+"</font>  change to state "
			+fonthuge+(relaystate?'<a href="?command=0">off</a>':' <a href="?command=1">on</a>')+"</font></big>";
	ret+="</body><html>";

	return ret;
}


function onPageRequest(req, res) {
     
  console.log("Serving request");
  
  var a = url.parse(req.url, true);
    
  var changed =false;
  if (a.query && "command" in a.query) {
		relaystate=Number(a.query["command"]);
		changed = true;
        console.log("changed to "+relaystate);
	}
 
  
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(getPage(changed));
  
    if(changed==true) {
      digitalWrite(D2, !relaystate);
      digitalWrite(NodeMCU.D1, !relaystate);
      console.log("written");
    }
  
}
DHTConnect();

setInterval("DHTRead();",500);

var http = require("http");

http.createServer(onPageRequest).listen(8080);

digitalWrite(D2, !relaystate);
digitalWrite(NodeMCU.D1, !relaystate);