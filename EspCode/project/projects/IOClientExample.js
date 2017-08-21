
// use modules from flash
// cut modules into 4k
// server from drain


// use modules from flash
// cut modules into 4k
// server from drain


function loadFlashModule(mod,loader) {
  
  if(Modules.getCached().indexOf(mod)>-1) Modules.removeCached(mod);
  m=require(loader).load(mod+".js");
  if(m==undefined)  {print("Module not found in flash : "+mod);return false;}
  else {Modules.addCached(mod,m);return true;}
}



var iod;
var r=require;
	
var start=function(){

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

	print("All modules loaded :"+suc);


	///////////////////

//	r("WifiSync").WifiSync();

	// IOData init
	iod=new (r("IOData"))();

	iod.updateNode({name:"Humidity", type:"input", unit:"\%", val:"-99"});
	iod.updateNode({name:"Temperature", type:"input", unit:"°C", val:"-999"});
	iod.updateNode({name:"Relay1", type:"output",  val:"0"});
	iod.updateNode({name:"Relay2", type:"output",  val:"0"});


	iod.updateRule({name:"MaxHumidity",cvar:"Humidity",ccomp:"less",cval:"80",actvar:"Relay",actval:"1"});


	// Wifi sync
	
	var w=require("Wifi");
	if(w.getStatus().station==="connected") {
 		r("WifiSync").WifiSync();
 	} else {
		print("Wifi "+w.getStatus().station+" - Server start and clock sync wait until wifi connected...or disconnected"); 
		var fn3= function () {
			
			print("Starting server...");
//			ser.createServer();	
			w.removeListener("connected",fn3);
			w.removeListener("disconnected",fn3);

			if(w.getStatus().station==="connected") r("WifiSync").WifiSync();


		};
		w.on("connected",fn3);
		w.on("disconnected",fn3);
	}
	
  
  // dht memory usage : module code : 72 block, execution : 29 -100 block (timer callback)
	n=10;
//	inter=setInterval(tim, 5000);
	
	
};

function dhtr(a){
		print("Temperature is "+a.temp.toString()+'°C');
		print("Humidity is "+a.rh.toString()+' \%');
 //		iod.updateNode("Temperature","val",a.temp);
 //		iod.updateNode("Humidity","val",a.rh );
}

function tim() { 
    if(true) {
     require("DHT22").connect(NodeMCU.D4).read(dhtr);
    //  trace();
    }
	
 //  require("MemD").MemD(E.getSizeOf(global, 3),JSON.parse(m));

  n--;if(n==0) clearInterval(inter); // 114 blocks are freed when timer stops
  print("T-"+JSON.stringify(process.memory()));
  
}

E.setFlags({pretokenise:1});

E.on("init",start);



/*
var m;
var memd;
var start=function(){
	print("mem init");
	print("0-"+JSON.stringify(process.memory()));

	//var 
	m=JSON.stringify(E.getSizeOf(global, 3));
//	print("0.1-"+JSON.stringify(process.memory()));

	
	med();
	print(".9-"+JSON.stringify(process.memory()));
	delete med;
	print("1-"+JSON.stringify(process.memory()));

//	memd=(require("MemD"));
  //    memd.MemD(E.getSizeOf(global, 3),JSON.parse(m));
};

var iod;
var wifi;
function med(){
//	var wifi=require("Wifi");

	iod=new (require("IOData"))();

	iod.updateNode({name:"Humidity", type:"input", unit:"\%", val:"-99"});
	iod.updateNode({name:"Temperature", type:"input", unit:"°C", val:"-999"});
	iod.updateNode({name:"Relay1", type:"output",  val:"0"});
	iod.updateNode({name:"Relay2", type:"output",  val:"0"});
						
	
	iod.updateRule({name:"MaxHumidity",cvar:"Humidity",ccomp:"less",cval:"80",actvar:"Relay",actval:"1"});

//	ser=new (require("IOServer"))(iod);	

	w=require("Wifi");
	if(wifi.getStatus().station==="connected") {
//		ser.createServer();	
	//	require("WifiSync").syncHTTPTime();
	//	Modules.removeCached("WifiSync");
	} else {
		print("Wifi "+w.getStatus().station+" - Server start wait until connected...or disconnected"); 
		var fn3= function () {
			print("Starting server...");
//			ser.createServer();	
			w.removeListener("connected",fn3);
			w.removeListener("disconnected",fn3);
	//		require("WifiSync").syncHTTPTime();
	//		Modules.removeCached("WifiSync");
		};
		w.on("connected",fn3);
		w.on("disconnected",fn3);
		
	}



	// dht memory usage : module code : 72 block, execution : 29 -100 block (timer callback)
	n=1;
	inter=setInterval(tim, 5000);
   //  trace();
}
 
var n;
var inter;

function dhtr(a){
		print("Temperature is "+a.temp.toString()+'°C');
		print("Humidity is "+a.rh.toString()+' \%');
//		iod.updateNode("Temperature","val",a.temp);
//		iod.updateNode("Humidity","val",a.rh );
}

function tim() { 
    if(true) {
  //   require("DHT22").connect(NodeMCU.D4).read(dhtr);
    //  trace();
    }
	
 //  require("MemD").MemD(E.getSizeOf(global, 3),JSON.parse(m));

  n--;if(n==0) clearInterval(inter); // 114 blocks are freed when timer stops
  print("T-"+JSON.stringify(process.memory()));
  
}




E.on("init",start);
//var v="\xFF";
//delete global[v].history;
//delete v;
//save();
//start();


//E.on("init",start);
*/