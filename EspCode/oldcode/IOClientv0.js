

var DHTPIN=NodeMCU.D4;

//var sens=new DHT22IOInput();
//var relay=new  RelayIOOutput();

var wi=require("Wifi");

var mess="";
var messn=0;

mess+="\n"+messn+"> station: "+wi.getStatus().station+", ap: "+wi.getStatus().ap+", ip: "+wi.getIP().ip;
mess+="\n"+messn+"> station: "+require("Wifi").getStatus().station+", ap: "+require("Wifi").getStatus().ap+", ip:"+require("Wifi").getIP().ip;messn++;

var ser=new (require("IOServer"))();

wi.on('connected', function(details) {
  wi.setSNTP("us.pool.ntp.org",3); 
  //syncHTTPTime();
//  ser.createServer();
  mess+="\n"+messn+"> CONNECTED ! station: "+wi.getStatus().station+", ap: "+wi.getStatus().ap;messn++;

});

console.log("init: "+wi.getDetails().ssid);

E.on('init', function() { ser.createServer(); });
                         
//ser.createServer();


ser.subscribeInput("Humidity");
ser.subscribeInput("Temperature");


var dht22=require("DHT22");
 
function displayWifi(){
  var w=require("Wifi");
  console.log("Wifi router:"+JSON.stringify(w.getStatus().station)+", name: '"+w.getDetails().ssid+ "', ip: "+w.getIP().ip);
   console.log("Ap :"+JSON.stringify(w.getStatus().ap)+", name: '"+w.getAPDetails().ssid+ "', ip: "+w.getAPIP().ip);
}

setInterval(function() {
 var dht = dht22.connect(DHTPIN);
 dht.read(function (a){
 console.log("Temperature is "+a.temp.toString());
 console.log("Humidity is "+a.rh.toString());
 //  displayWifi();
mess+="\n"+messn+"> station: "+wi.getStatus().station+", ap: "+wi.getStatus().ap+", ip: "+wi.getIP().ip;
mess+="\n"+messn+"> station: "+require("Wifi").getStatus().station+", ap: "+require("Wifi").getStatus().ap+", ip:"+require("Wifi").getIP().ip;messn++;
 console.log(mess);  
   ser.updateInput("Humidity",a.rh.toString() );
   ser.updateInput("Temperature",a.temp.toString() );
   
 });
}, 5000);