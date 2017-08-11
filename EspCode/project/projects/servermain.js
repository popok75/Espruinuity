
//require("IOServer");
/*
setInterval(function() {
  var r=new (require("DHT22Reader"))(NodeMCU.D4);
  r.readDHT22(function(a){
             console.log("sTemperature is "+a.temp.toString());
			 console.log("sHumidity is "+a.rh.toString());
  });
 
}, 3000);
*/
/*
function onPageRequest(req, res) {
  console.log("request ");
  var a = url.parse(req.url, true);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body>');
  res.write('<p>Pin is '+(1?'on':'off')+'</p>');
  res.write('<a href="?led=1">on</a><br/><a href="?led=0">off</a>');
  res.end('</body></html>');
  if (a.query && "led" in a.query)
    digitalWrite(LED1, a.query["led"]);
}
var ht=require("http");
  ht.createServer(onPageRequest).listen(8080);
console.log("server created:");
console.log((require("Wifi")).getIP());
*/

var ser=new (require("IOServer"))();


/*
var server = require("net").createServer(function(c) {
  // A new client as connected
  console.log("request ");
  c.write("Hello");
  /*c.on('data', function(data) {
    console.log(">"+JSON.stringify(data));
  });
  c.end();
});

server.listen(80);
console.log("server created:");
console.log((require("Wifi")).getIP());
*/