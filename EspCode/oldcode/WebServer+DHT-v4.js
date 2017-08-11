var dht ;
var tempsensor="init";
var humsensor="init";

var hummax=80;
var hummin=40;

var fonthuge="<font size=\"46\">";
var fontbig="<font size=\"24\">";
var fontmed="<font size=\"6\">";

var relaystate=0;



function DHTConnect() {
   mod = require("DHT22");
   dht = mod.connect(NodeMCU.D2);
}

function dhtreader (a) {
 tempsensor=a.temp;
  humsensor=a.rh;
  console.log("temp:"+tempsensor+", RH:"+humsensor);
}

function DHTRead() {
  var dhtread = dhtreader;
  dht.read(dhtread);
 // console.log("reading");

 
}

function sendToDweet() {
//tempsensor=a.temp.toString();
   var data = {
        Temperature: tempsensor.toString(),
        RelativeHumidity:humsensor.toString(),
        RelayState : relaystate,
        HumidityMin : hummin,
        HumidityMax : hummax
      };
      putDweet("manitaria", data, function(response) {
//        console.log(response);
        myObj = JSON.parse(response);
        console.log("dweet:"+myObj.this);
      });
}

function putDweet(dweet_name, a, callback) {
  var data = "";
  for (var n in a) {
    if (data.length) data+="&";
    data += encodeURIComponent(n)+"="+encodeURIComponent(a[n]); 
  }
  var options = {
    host: 'dweet.io',
    port: '80',
    path:'/dweet/for/'+dweet_name+"?"+data,
    method:'POST'
  };
  require("http").request(options, function(res)  {
    var d = "";
    res.on('data', function(data) { d+=data; });
    res.on('close', function(data) {
      if (callback) callback(d);
    });
 }).end();
}

function getHtmlReading() {
	return "Temperature :"+fonthuge+tempsensor.toString()+"°C</font> <br> RH: "+fontbig+humsensor.toString()+"%</font>";
}

function getPage(a ) {
    var htmlReading=getHtmlReading();
	var ret="<html>";
   //   console.log("a:"+a);
	if (a===true){
      ret+='<meta http-equiv="refresh" content="5; url=/" />';
     // console.log("back to homepage:"+a);
    }
	else{
      ret+='<meta http-equiv="refresh" content="10 ; url=/">';
   //   console.log("refresh"+a);
    }
	ret+="<body>";
	if (a===true) ret+="<p> Espruino : updated value ...<br><big>";
      else ret+="<p> Espruino : <br><big>";
    ret+=htmlReading+"</big></p>";
    if (a===true) ret+=' <p><big> Relay changed to ';
    else ret+=' <p><big> Relay is ';
      ret+=fonthuge+(relaystate?'on':'off')+"</font> (Change it to : "
			+fontmed+(relaystate?'<a href="?command=0">off</a>':' <a href="?command=1">on</a> ')+" </font>? )</big>";
  
    ret+=getForm();
  
	ret+="</body><html>";

	return ret;
}


/// FORM

function getForm() {
 var ret="";
 ret+='<form> Min: <input type="text" name="hummin" value='+hummin+'> ';
  ret+='<select name="minrun">'
    +'<option value="start">start</option>'
  +'<option value="stop">stop</option></select><br>';
  ret+='Max: <input type="text" name="hummax" value='+hummax+'>';
 ret+='<select name="maxrun">'
  +'<option value="start">start</option>'
  +'<option value="stop">stop</option></select><br>';
   ret+='<input type="submit" value="Change" >';
   ret+='</form>';

 return ret;
}




function onPageRequest(req, res) {
     
  console.log("Serving request");
  
  var a = url.parse(req.url, true);
    
//   if(a.query) console.log("nquery"+("hummin" in a.query));
//  else console.log("n a null");
 var changed =false;
  if (a.query && "command" in a.query) {
		relaystate=Number(a.query["command"]);
		changed = true;
        console.log("changed to "+relaystate);
	}
 // if(a.query) console.log("query"+("hummin" in a.query));
//  else console.log("a null");
 if (a.query && "hummin" in a.query) {
		hummin=Number(a.query["hummin"]);
		hummax=Number(a.query["hummax"]);
		humchanged = true;
        console.log("hum changed to "+hummin+' '+hummax);
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

setInterval("DHTRead();",1000);
setInterval("sendToDweet();",5000);   // ideally dweet only when there is a change of value

var http = require("http");

http.createServer(onPageRequest).listen(8080);

digitalWrite(D2, !relaystate);
digitalWrite(NodeMCU.D1, !relaystate);