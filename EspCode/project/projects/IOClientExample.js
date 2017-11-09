


var r=require;

//var dht22;

var iod,ser,log,plug,fst;
var autoreadinter=-1,tsinter=-1;
var wi=require("Wifi"); 


function loadFlashModules(mods,loader) {
	var sm=0;
	for(var i=0;i<mods.length;i++){var mod=mods[i];
	if(Modules.getCached().indexOf(mod)>-1) Modules.removeCached(mod);
	var m=require(loader).load(mod+".js");
	if(!m)  {print("Module not found in flash : "+mod);return false;}
	else {
		var s;
		s=process.memory().usage;
		
		Modules.addCached(mod,m);
		sm+=(process.memory().usage-s);print("Module in flash loaded: "+mod+" : "+(process.memory().usage-s)+" block mem usage");}
//	print("init:",process.memory());
	}
	print("All Modules : "+sm+" block mem usage");
	return true;
}


function init(){

	//   require("WifiSync");    // 22
//    require("IOPlug");  // 20
 //   require("IOLog");  // 20
	//   require("DHT22");     // 34
	//   require("IOData");    // 104
	//   require("FlashStoreAll");    // 107
//	require("IOServer");
 

	require("FlashStringLoader");

	var l=true;
	var loader="FlashStringLoader";
//	suc=loadFlashModules(["FlashString"],loader);
//	Modules.removeCached("FlashStringLoader");
//	loader="FlashString";

	l=loadFlashModules(["WifiSync","DHT22non","FlashStore","IOPlug","IOLog","IOData","IOServer"],loader);
//	l=loadFlashModule("IOServer",loader);
//	suc = suc && l;

	if(l) print("All modules loaded !");
	else {print("Modules can't be loaded ! Quitting...");return false;}
	//print(process.memory());
	return l;
};

function reconnect(){
	wi.disconnect(function(err){wi.restore();print("restarted wifi",wi.getStatus());});
}

function correct(t){if(t>0){plug.ct(t);iod.ct(t);} else plug.cleants=1; setTimeout("Modules.removeCached('WifiSync');print('corrected',process.memory());",5);};

function startServer(v){
//	print("startServer 1 :",process.memory());
	if(wi.getStatus().station==="connected") r("WifiSync").WifiSync(correct);
	print("Starting server...");
//	print("startServer 2 :",process.memory()); // 89 block (for http req + callbacks)
	ser=r("IOServer").IOServer({data:iod,fs:fst});
//	print("startServer 3 :",process.memory()); // 27
	if(v!==1) {
		wi.removeListener("connected",startServer);
		wi.removeListener("disconnected",startServer);	
	}
	setTimeout("delete startServer;print('removed server init ',process.memory());",5);
	print("startServer 4 :",process.memory());
}



function dhtread(a){setTimeout(dhtread2.bind(this,a),20);};

function dhtread2(a){
	var prof=Date().getTime();
	var f=this;
print("Temperature is "+a.temp.toString()+'°C');
print("Humidity is "+a.rh.toString()+' \%');
f({name:"Temperature",val:a.temp.toString()},0);
f({name:"Humidity",val:a.rh.toString()},1);  
print("+dhtread2 executed in",Date().getTime()-prof,"ms");
}

function plugpull(o,f) {      
	if(o==="*")  setTimeout(function(){r("DHT22non").DHT22(NodeMCU.D2, dhtread.bind(f));},5);
};

function autoreader(){
	print("refreshing values");
	plug.respond({event:"pull",object:"*"});
}


var tsn=10;
function timestamper(){
	var sav={k:"Timestamp", ts:Math.floor(Date().getTime()), m:2, inter:0, sync:log.fileo.maxsync};
	print("saving to flash :",sav.ts,"-",(new Date(sav.ts)).toString());
	log.saveToFlash(sav);	
	if(tsn==0) clearInterval(tsinter);
	else tsn--;
}

function start(){
	var prof=Math.round(Date().getTime());
	var u=process.memory().usage;
	print("pre-init:",process.memory().usage-u," blocks");u=process.memory().usage;
	if(!init()) return false;
	// no need nomore for loadFlashModule and FlashString
	print("post-modules:",process.memory().usage-u," blocks");u=process.memory().usage; // 383 with flashloader removed
	Modules.removeCached("FlashStringLoader");
	delete loadFlashModules;
	delete init;
	delete Modules; // finished loading
	print("post-init:",process.memory()); // 383 with flashloader removed




	iod= new (r("IOData"))();
	print("iod created:",process.memory().usage-u);u=process.memory().usage;  // 
	
	plug=new (r("IOPlug"))(iod);
	plug.pull=plugpull;
	print("io plug created:",process.memory().usage-u);u=process.memory().usage;  // 

//	var u=process.memory().usage;autoreadinter=setInterval(autoreader,5000);	
	print("autoread timer created:",process.memory().usage-u);u=process.memory().usage;  // 

	fst = new(r("FlashStore"))(require("Flash").getFree()[3].addr);
	print("post flashstore:",process.memory().usage-u);u=process.memory().usage; 
	
	
	plug.log={fs:fst,flashfile:{}};
   print("plug.log",plug.log);
//	log=new (r("IOLog"))(fst);
	print("IOLog created:",process.memory().usage-u);u=process.memory().usage;  // 
	
	// sync with last log/ts 	
	var now=Date().getTime(),recent=1508852814967;
	if(now<recent) {
		var ts=(r("IOLog"))({flt:1,mm:{fs:fst}}), minreboot=5;
		if(ts>now) {
			print("changed time based on flash files to ",(new Date(ts)).toString());
			setTime(minreboot+ts/1000);
			print("prof",prof,ts,now);
			prof+=ts-now;
		} else print("flashtime discarded");		
	} else plug.cleants=true;	// if from init time is high => already synced or dirty+manual reset/load(nopoweroff)
	
	print("time now ",(Date()).toString());
	print("got flashtime:",process.memory().usage-u);u=process.memory().usage;  // 
	
	// start a timestamp writer
//	tsinter = setInterval(timestamper,1000);	
	print("post autostamper:",process.memory().usage-u);u=process.memory().usage;  // 
	
	
	//plug.log=log;
	
	plug.logger("start");
	print("IOLog started:",process.memory().usage-u);u=process.memory().usage;  // 

	print("io log logger started:",process.memory().usage-u);u=process.memory().usage;  //
	print("post-log logger:",process.memory()); // 383 with flashloader removed


	


	iod.updateNode({name:"Humidity", type:"input", unit:"\%", val:"-99"});
	//print("updateNode1:",process.memory());  // - +timer
	iod.updateNode({name:"Temperature", type:"input", unit:"°C", val:"-999"});
//	print("updateNode2:",process.memory());  // -
	iod.updateNode({name:"Relay1", type:"output",  val:"0"});
//	print("updateNode3:",process.memory());  // -
	iod.updateNode({name:"Relay2", type:"output",  val:"0"});
	print("updateNode4:",process.memory().usage-u);u=process.memory().usage;  // 



	iod.updateRule({name:"MaxHumidity", type:"rule", ctype:"compare", active:"0",cvar:"Humidity",ccomp:"greaterorequal",cval:"85",acttype:"node",actvar:"Relay2",actval:"0"});
	//  print("updateRule 1:",process.memory()); // - - 14
	iod.updateRule({name:"MinHumidity", type:"rule", ctype:"compare", active:"1",cvar:"Humidity",ccomp:"less",cval:"75",acttype:"rule",actvar:"MaxHumidity",actval:"1"});
//	print("updateRule 2:",process.memory()); // - - 21
	iod.updateRule({name:"Timerule", type:"rule", ctype:"timer", active:"1", ts:"-1", t1:"10",t2:"10:00", cyc:"1",acttype1:"node",actvar1:"Relay2",actval1:"1",acttype2:"node",actvar2:"Relay2",actval2:"0"});

	print("updateRule 3:",process.memory().usage-u);u=process.memory().usage;  // 

	// post iod


	// 	var fs = new(require("FlashStore"))(require("Flash").getFree()[3].addr);
	// ser.fs.removeItem("/log/Temperature/0-cur");
	// fs.removeItem("/log/Humidity/0-cur");
	// fs.removeItem("/log/Temperature/0-cur");
	// fs.removeItem("/log/Relay2/0-cur");
		
	//	fs.wget('/','http://192.168.2.2/modelcomp.html',{mime:'text/html', compress:1});
	//	fs.wget('/js/IOServerScript.js','http://192.168.2.2/js/IOServerScriptcomp.js',{mime:'text/javascript', compress:1});
	//	fs.wget('/js/graph.js','http://192.168.2.2/js/graphcomp.js',{mime:'text/javascript', compress:1});


 

 

	setInterval(reconnect,5*60*1000);


	print("post reconnect:",process.memory().usage-u);u=process.memory().usage; 


	if(wi.getStatus().station==="connected") {
		startServer(1);

	} else {
		print("Wifi "+wi.getStatus().station+" - Server start and clock sync wait until wifi connected...or disconnected"); 		
		wi.on("connected",startServer);
		wi.on("disconnected",startServer);
	}
	// clean

	print("post startServer:",process.memory().usage-u);u=process.memory().usage; 

	print("main end !",process.memory());  //705
	// last 673

	setTimeout("delete start;print('removed start func ',process.memory());",5);
	print("start executed in",Math.round(Date().getTime())-prof,"ms");
};

E.setFlags({pretokenise:1});

print(process.memory());  // 112 with flashloader
print("initializing...5sec");
//print(E.getSizeOf(global,1));
setTimeout(start,5000); 
