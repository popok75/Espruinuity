
function loadFlashModule(mod,loader) {
  
  if(Modules.getCached().indexOf(mod)>-1) Modules.removeCached(mod);
  var m=require(loader).load(mod+".js");
  if(m==undefined)  {print("Module not found in flash : "+mod);return false;}
  else {Modules.addCached(mod,m);return true;}
}



var iod;
var r=require;
var dht22;
	
var start=function(){
  
 

   
// setInterval(dht22_read_test,5000);
// return;
  
  
//    require("IOPlug");
//    require("IOData");
//    require("IOServer");
//    require("IOServerHeader");
	///require("IOServerStrings");
	
    require("FlashStringLoader");
    
	var suc,l=true;
	var loader="FlashStringLoader";
	suc=loadFlashModule("FlashString","FlashStringLoader");
	Modules.removeCached("FlashStringLoader");
	loader="FlashString";

	l=loadFlashModule("WifiSync",loader);
	suc = suc && l;
	l=loadFlashModule("IOData",loader);
	suc = suc && l;
    l=loadFlashModule("IOPlug",loader);
	suc = suc && l;
	l=loadFlashModule("DHT22",loader);
	suc = suc && l;
    l=loadFlashModule("IOServer",loader);
	suc = suc && l;
    l=loadFlashModule("IOServerHeader",loader);
	suc = suc && l;
    l=loadFlashModule("IOServerStrings",loader);
	suc = suc && l;

	if(suc) print("All modules loaded !");
    else {print("Modules can't be loaded ! Quitting...");return;}


//  print("MEMORY after modules-"+JSON.stringify(process.memory()));
	///////////////////

 //   n=10;
 //	inter=setInterval(tim, 5000);
  
//	r("WifiSync").WifiSync();

	// IOData init
	iod=new (r("IOData"))();
//  print("MEMORY after iodata -"+JSON.stringify(process.memory()));
  
   var plug=new (r("IOPlug"))(iod);
//  print("MEMORY after ioplug-"+JSON.stringify(process.memory()));
   plug.pull=function(o,f) {
      print("plug.pull local function");
      function fs(a){
        print("Temperature is "+a.temp.toString()+'°C');
		print("Humidity is "+a.rh.toString()+' \%');
        f({name:"Temperature",val:a.temp.toString()});
        f({name:"Humidity",val:a.rh.toString()});
      };
      if(o==="*")  r("DHT22").connect(NodeMCU.D2).read(fs);
    };
    plug.push=function(o,f2) {
      print("plug.push local function",JSON.stringify(o));    
      print("turn relay on/off");
//       print("MEMORY after relay -"+JSON.stringify(process.memory()));
       
      setTimeout(function(){f2(o);},5);
    };
//    print("MEMORY after ioplug functions-"+JSON.stringify(process.memory()));
 
	iod.updateNode({name:"Humidity", type:"input", unit:"\%", val:"-99"});
	iod.updateNode({name:"Temperature", type:"input", unit:"°C", val:"-999"});
	iod.updateNode({name:"Relay1", type:"output",  val:"0"});
	iod.updateNode({name:"Relay2", type:"output",  val:"0"});
 
//   print("MEMORY after nodes-"+JSON.stringify(process.memory()));
 
    iod.updateRule({name:"MaxHumidity", type:"rule", ctype:"compare", active:"0",cvar:"Humidity",ccomp:"greaterorequal",cval:"85",acttype:"node",actvar:"Relay2",actval:"0"});
	iod.updateRule({name:"MinHumidity", type:"rule", ctype:"compare", active:"1",cvar:"Humidity",ccomp:"less",cval:"75",acttype:"rule",actvar:"MaxHumidity",actval:"1"});
 
    iod.updateRule({name:"Timerule", type:"rule", ctype:"timer", active:"1", ts:"-1", t1:"10",t2:"10:00", cyc:"1",acttype1:"node",actvar1:"Relay2",actval1:"1",acttype2:"node",actvar2:"Relay2",actval2:"0"});
    
//    relay1 on 25sec relay2 on remaining 60min cycle
    
//   print("MEMORY after rules-"+JSON.stringify(process.memory()));
 
	// Wifi sync
	
    var ser = new (r("IOServer"))(iod);	
//   print("MEMORY after server-"+JSON.stringify(process.memory()));
 
	var w=require("Wifi");
	if(w.getStatus().station==="connected") {
       r("WifiSync").WifiSync(function(t){if(t>0){plug.correctTimestamps(t);iod.ct(t);}});
//       print("MEMORY after wifisync-"+JSON.stringify(process.memory()));
       ser.createServer();
//       print("MEMORY after server create-"+JSON.stringify(process.memory()));
       setInterval(function(){require("Wifi").disconnect(function(err){require("Wifi").restore();print("restarted wifi",require("Wifi").getStatus());});},5*60*1000);
 		
 	} else {
		print("Wifi "+w.getStatus().station+" - Server start and clock sync wait until wifi connected...or disconnected"); 
		var fn3= function () {
//           print("MEMORY before server create-"+JSON.stringify(process.memory()));
 
			if(w.getStatus().station==="connected")  r("WifiSync").WifiSync(function(t){print("t:",t);if(t>0) {plug.correctTimestamps(t);iod.ct(t);}});
			print("Starting server...");
			ser.createServer();	
//			print("MEMORY after server create-"+JSON.stringify(process.memory()));
 w.removeListener("connected",fn3);
			w.removeListener("disconnected",fn3);
      setInterval(function(){require("Wifi").disconnect(function(err){require("Wifi").restore();print("restarted wifi",require("Wifi").getStatus());});},5*60*1000);
			
      
		};
		w.on("connected",fn3);
		w.on("disconnected",fn3);
	}
  
  
  // dht memory usage : module code : 72 block, execution : 29 -100 block (timer callback) 	    
//  iod.updateNode({"name":"Relay2","type":"output","val":"0"});
 // iod.request({event:"push", object:{"name":"Relay2","type":"output","val":"0"}});
  
    n=3;
 	inter=setInterval(tim, 5000);
  
   
  
//   	iod.updateNode({name:"Temperature", val:"XX"});
     // iod.updateNode("Humidity","val",a.rh );
	
  
    print("end-"+JSON.stringify(process.memory()));
    print("plug mem:",E.getSizeOf(plug));
   // print("plug mem:",E.getSizeOf(global,2));
    //print("plug mem:",E.getSizeOf(plug,2));
  
};

function dhtr(a){
		print("Temperature is "+a.temp.toString()+'°C');
		print("Humidity is "+a.rh.toString()+' \%');
 	//	iod.updateNode({name:"Temperature",val:a.temp.toString()});
 	//	iod.updateNode({name:"Humidity",val:a.rh.toString()} );
        timed=true;
}
var timed=true;
function tim() { 
    if(timed) {
      timed=false;
      print("dht waiting for reading ",n);
      r("DHT22").connect(NodeMCU.D2).read(dhtr);
    //  trace();
    }
	
 //  require("MemD").MemD(E.getSizeOf(global, 3),JSON.parse(m));

  n--;if(n==0) clearInterval(inter); // 114 blocks are freed when timer stops
  print("T-"+JSON.stringify(process.memory()));

}
 
E.setFlags({pretokenise:1});

//E.on("init","setTimeout(start,5000);");
setTimeout(start,5000);
print("initializing...5sec");
//start();