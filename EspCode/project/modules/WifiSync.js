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
	//E.setTimeZone(3);
	var timezone=3;
	require("Wifi").setSNTP(sntpserver,3);
	print("syncHTTP started ...");
	var req=require("http").get('http://google.gr', function(res) {
		res.on('close', function(data) {
		    console.log("Connection closed");
		  });
		var v="";
	//	print("got page : ");
		var da=res.headers["Date"];
	//	print(da);
		if( da ==='undefined') {print("WifiSync - No timestamp found");return 0;}
		var d= Date(Date(da).getTime()+timezone*60*60*1000); 
	//	print(d.toString());
		
		var diff=Date().getTime()-d.getTime();
	//	print("diff:"+diff);
		var timeout=1*60*60*1000;
		if(diff<-timeout) {
			httpsync=true;
			setTime((d.getTime())/1000);
			print("setting internal clock to internet time : "+Date().toString());
		} else print("WifiSync -Dismissed http time, too near or earlier : "+Math.round(diff)+"ms at "+Date().toString());

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
	req.on('error', function(e) {
			  console.log("Socket error", e);
		});;
	
}

