/// Mem to update
// MemD memory usage : leave only http and Wifi cached in modules (tested both connected & disconnected)
// - module (code) = 	169 block 
// - sync peak ~  		192 block
// - async peak ~ 		288 block
//		- code ~	188 block or 104 block
// 			- httpget 			118 block + 41 reply + 18 local vars
// 			- wifi onconnect 	34 block
// 			- timer 120s		70 block


exports.WifiSync = function(){
	var sntpserver="gr.pool.ntp.org";
	require("Wifi").setSNTP(sntpserver,3);
	print("syncHTTP started ...");
	var req=require("http").get('http://google.gr', function(res) {
		var v="";
		
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
/*		delete Date;
		delete Math;
		// unload object returned by get
		delete req;
	*/	// unload objects left
		delete httpCRs;
		delete httpCRq;

//		delete syncHttp;
		
		 delete global['\u00ff'].HttpCC;
		});
	
}

