






var httpsync=false;
function wifiDetails(wifi){
	return "AP '"+wifi.getStatus().ap+"' named '"+wifi.getAPDetails().ssid+"' , station "+wifi.getStatus().station+" to '"+wifi.getDetails().ssid+"'";
}

exports.syncClock = function () {
	var wifi=require("Wifi");
	//	console.log("WifiSync - init : "+wifiDetails(wifi));  

	var before=process.memory().usage;

	if(wifi.getStatus().station==="connected") {
		console.log("WifiSync - ALREADY connected: "+wifiDetails(wifi));        
		wifi.setSNTP("gr.pool.ntp.org",3);
		syncHTTPTime();

	} else {
		//		console.log("WifiSync - NOT YET connected: "+wifiDetails(wifi)); 
		/*			wifi.on("connected", function () {
				console.log("NOW connected: "+wifiDetails(wifi)); 		
				wifi.setSNTP("gr.pool.ntp.org",3);
				syncHTTPTime();
			});*/
	}
	console.log("------> sync clock 2 memsize :" +(process.memory().usage-before)*16);
	return;
	var prev=Date();
	var inittime=prev;
	const dur=2000, min=0.9,max=1.1;
	const maxmonitortime=2*60*1000;
	var inter=setInterval(function(){
		var now=Date();
		var diffratio=(now.getTime()-prev.getTime())/dur;

		if(diffratio<min || diffratio>max) {
			inittime+=now.getTime()-(prev.getTime()+2000);
			if(httpsync) {console.log("WifiSync - clock synced through HTTP :"+Date().toString()); httpsync=false;}
			else console.log("WifiSync -  clock synced "+Math.round((1-diffratio)*dur)+"ms through SNTP :"+Date().toString());
		}
		prev=now;
		if((now-inittime)>maxmonitortime) {
			clearInterval(inter);
			console.log("WifiSync - clock sync monitoring stopped after "+Math.round((now-inittime)/1000)+"s");
		}
	},dur);
}
exports.onDisconnected= function(f) {
	var wifi=require("Wifi");
	if(wifi.getStatus().station==="disconnected") {
		f();
	} else {

		wifi.on("disconnected", function () {
			console.log("WifiSync.onDisconnected -NOW DISconnected: "+wifiDetails(wifi)); 		
			f();
		});
	}
}


exports.onConnected= function(f) {
	var wifi=require("Wifi");
	if(wifi.getStatus().station==="connected") {
		//		console.log("WifiSync.onConnected - ALREADY connected: "+wifiDetails(wifi));        
		f();

	} else {
//		console.log("WifiSync.onReady - NOT YET connected: "+wifiDetails(wifi)); 
		wifi.on("connected", function () {
			console.log("WifiSync.onReady -NOW connected: "+wifiDetails(wifi)); 		
			f();
		});
		/*	wifi.on("disconnected", function () {
							console.log("WifiSync.onReady -NOW DISconnected: "+wifiDetails(wifi)); 		
						//	f();
						});
			wifi.on("*", function () {
				console.log("WifiSync.onReady - all event: "+wifiDetails(wifi)); 		
			//	f();
			});
			wifi.on("associated", function () {
				console.log("WifiSync.onReady - associated event: "+wifiDetails(wifi)); 		
			//	f();
			});
			wifi.on("auth_change", function () {
				console.log("WifiSync.onReady - auth_change event: "+wifiDetails(wifi)); 		
			//	f();
			});
			wifi.on("dhcp_timeout", function () {
				console.log("WifiSync.onReady - dhcp_timeout event: "+wifiDetails(wifi)); 		
			//	f();
			});
			wifi.on("probe_recv", function () {
				console.log("WifiSync.onReady - probe_recv event: "+wifiDetails(wifi)); 		
			//	f();
			});
			wifi.on("sta_joined", function () {
				console.log("WifiSync.onReady - sta_joined event: "+wifiDetails(wifi)); 		
			//	f();
			});
			wifi.on("sta_left", function () {
				console.log("WifiSync.onReady - sta_left event: "+wifiDetails(wifi)); 		
			//	f();
			});
		 */
	}

}

function syncHTTPTime(){
    var http=require("http");
	var req;
    req=require("http").get('http://google.gr', function(res) {
    //     console.log("GOT PAGE !");
	//	 print(process.memory());

		var da=res.headers["Date"];
		if( da ==='undefined') {console.log("WifiSync - No timestamp found");return 0;}
		var d= Date(Date(da).getTime()+3*60*60*1000);  // Timezone +3
		var l=  Date();
		var diff=l.getTime()-d.getTime();
		//console.log("diff:"+Math.round(diff)+"ms");
		var timeout=1*60*60*1000;
		if(diff<-timeout) {
			httpsync=true;
			setTime(d.getTime()/1000);
			             console.log("setting internal clock to internet time : "+d.toString());
		} else console.log("WifiSync -Dismissed http time, too near : "+Math.round(diff)+"ms at "+Date().toString());
      
		res.removeAllListeners();
		req.end();
//        req=null;
         // unload typed function objects // should use new ?
        delete Date;
        delete Math;
        
        // unload object returned by get
        delete req;
        // unload objects left
        delete httpCRs;
        delete httpCRq;
//        delete syncHttp;
        var v="\xFF";
        delete global[v].HttpCC;
        
        
    //    print(process.memory());
	});
}

/*
//	console.log("pre-net: free: "+process.memory().free*16+"b, used :"+process.memory().usage*16+"b, total:"+process.memory().total*16);
	var client = require("net").connect({host: "google.gr", port: 80}, function() {
		var datefound=false;
//		console.log('client connected');
		client.on('data', function(data) {
			//console.log(">"+data);
			var i=data.indexOf("Date:");
			if(i!=-1) {
				var e=data.indexOf("\n",i);
				var da=data.substring(i+6,e-1);
		//		console.log("--->DATE :'"+da+"'");
				datefound=true;
				
				var d= Date(Date(da).getTime()+3*60*60*1000);  // Timezone +3
				var l=  Date();
				var diff=l.getTime()-d.getTime();
				//console.log("diff:"+Math.round(diff)+"ms");
				var timeout=1*60*60*1000;
				if(diff<-timeout) {
					httpsync=true;
					setTime(d.getTime()/1000);
					console.log("setting internal clock to internet time : "+d.toString());
				} else console.log("WifiSync -Dismissed http time, too near : "+Math.round(diff)+"ms at "+l.toString());
				console.log("post-mem: free: "+process.memory().free*16+"b, used :"+process.memory().usage*16+"b, total:"+process.memory().total*16);
				client.end();
				delete data;
				delete client;
				console.log("postpost-mem: free: "+process.memory().free*16+"b, used :"+process.memory().usage*16+"b, total:"+process.memory().total*16);
				
			}

		});
		client.on('end', function() {
			if (!datefound) console.log("WifiSync - No timestamp found");
		});
		client.write("GET / HTTP/1.1\n\n");
		
	});

	
		var http=require("http");
		var req;
		function listr(res){
			console.log("pre-mem: free: "+process.memory().free*16+"b, used :"+process.memory().usage*16+"b, total:"+process.memory().total*16);

			var da=res.headers["Date"];
			if( da ==='undefined') {console.log("WifiSync - No timestamp found");return 0;}
			var d= Date(Date(da).getTime()+3*60*60*1000);  // Timezone +3
			var l=  Date();
			var diff=l.getTime()-d.getTime();
			//console.log("diff:"+Math.round(diff)+"ms");
			var timeout=1*60*60*1000;
			if(diff<-timeout) {
				httpsync=true;
				setTime(d.getTime()/1000);
				             console.log("setting internal clock to internet time : "+d.toString());
			} else console.log("WifiSync -Dismissed http time, too near : "+Math.round(diff)+"ms at "+Date().toString());
			res.removeAllListeners();
			req.end();
			console.log("post-mem: free: "+process.memory().free*16+"b, used :"+process.memory().usage*16+"b, total:"+process.memory().total*16);
		}
		  var options = {
				    host: 'http://google.gr',
				    port: '80',
				    path:'/',
				    method:'GET'
				  };
		//  require("http").request(options, listr).end();
		  req=require("http").get('http://google.gr',listr);
*/	 




//exports = syncClock;
