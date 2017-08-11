
var httpsync=false;
function wifiDetails(wifi){
	return "AP '"+wifi.getStatus().ap+"' named '"+wifi.getAPDetails().ssid+"' , station "+wifi.getStatus().station+" to '"+wifi.getDetails().ssid+"'";
}

syncClock = function () {
	var wifi=require("Wifi");
	
	//
	if(wifi.getStatus().station==="connected") {
		console.log("WifiSync - ALREADY connected: "+wifiDetails(wifi));        
		wifi.setSNTP("gr.pool.ntp.org",3);
	//	syncHTTPTime();

	} else {
		//		console.log("WifiSync - NOT YET connected: "+wifiDetails(wifi)); 
					wifi.on("connected", function () {
				console.log("NOW connected: "+wifiDetails(wifi)); 		
				wifi.setSNTP("gr.pool.ntp.org",3);
		//		syncHTTPTime();
			});
	}
	print(E.getSizeOf(global, 1));
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
};
print(process.memory());
syncClock();
print(process.memory());
