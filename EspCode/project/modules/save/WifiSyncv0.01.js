
// MemD memory usage : leave only http and Wifi cached in modules (tested both connected & disconnected)
// - module (code) = 	169 block 
// - sync peak ~  		192 block
// - async peak ~ 		288 block
//		- code ~	188 block or 104 block
// 			- httpget 			118 block + 41 reply + 18 local vars
// 			- wifi onconnect 	34 block
// 			- timer 120s		70 block


sntpserver="gr.pool.ntp.org";
var httpsync=false;

exports.syncClock = function (monitor) {

	if(!httpsync){
		// do sync
		var wifi=require("Wifi");
		wifi.setSNTP(sntpserver,3);  // still works ?	
		delete sntpserver;
		var stub='"AP \'"+require("Wifi").getStatus().ap+"\' named \'"+require("Wifi").getAPDetails().ssid+"\' , station "+require("Wifi").getStatus().station+" to \'"+require("Wifi")	.getDetails().ssid+"\'"';
		if(wifi.getStatus().station==="connected") {
			print("WifiSync - ALREADY connected: "+eval(stub));        
			syncHTTPTime();	
			//Modules.removeCached("Wifi");
			stub=0;			
		} else {
			print("WifiSync - NOT YET connected: "+eval(stub)); 
			var fn2= function () {
				print("NOW connected: "+eval(stub)); 		
				syncHTTPTime();			 
				print("before");
			//	print(E.getSizeOf(wifi,3));
				wifi.removeListener("connected",fn2);
			//	print("after:")
			//	print(E.getSizeOf(wifi,3));
				//Modules.removeCached("Wifi");
				stub=0;
			};
			wifi.on("connected",fn2);
		}
	}
	if(!monitor) return;
	// detect sync happened
	var prev=Date();
	var inittime=prev;
	const dur=2000;
	var inter;
	var f=function(){
		print("this:"+JSON.stringify(this));
		print("inter:"+JSON.stringify(inter));
		const min=0.9,max=1.1;
		const maxt=2*60*1000;		
		var now=Date().getTime();
		var diffratio=(now-prev)/dur;

		if(diffratio<min || diffratio>max) {
			inittime+=now-(prev+2000);
			if(httpsync) {print("WifiSync - clock synced through HTTP :"+Date().toString()); httpsync=false;}
			else {print("WifiSync -  clock synced "+Math.round((1-diffratio)*dur)+"ms through SNTP :"+Date().toString());delete Math;}
		}
		prev=now;
		if((now-inittime)>maxt) {
			clearInterval(inter);
			print("WifiSync - clock sync monitoring stopped after "+Math.round((now-inittime)/1000)+"s");
			delete Math;
		}
		delete Date;
		 

	};
	inter=setInterval(f,dur);
	
	delete Date;
}

function syncHTTPTime(){

	print("syncHTTP started ...");
	var req=require("http").get('http://google.gr', function(res) {
		
		var da=res.headers["Date"];
		if( da ==='undefined') {print("WifiSync - No timestamp found");return 0;}
		var d= Date(Date(da).getTime()+3*60*60*1000);  // Timezone +3
		var diff=Date().getTime()-d.getTime();
		var timeout=1*60*60*1000;
		if(diff<-timeout) {
			httpsync=true;
			setTime(d.getTime()/1000);
			print("setting internal clock to internet time : "+d.toString());
		} else print("WifiSync -Dismissed http time, too near : "+Math.round(diff)+"ms at "+Date().toString());

	//	print(JSON.stringify(res));
		req.removeAllListeners();
		req.end();
		// unload typed function objects // should use new ?
		delete Date;
		delete Math;
		// unload object returned by get
		delete req;
		// unload objects left
		delete httpCRs;
		delete httpCRq;
//		delete syncHttp;
		var v="\xFF";
		delete global[v].HttpCC;

		//Modules.removeCached("http");

	});
	
}

