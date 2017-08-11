// constants


//functions

function wifiDetails(wifi){
  return "AP '"+wifi.getStatus().ap+"' named '"+wifi.getAPDetails().ssid+"' , station "+wifi.getStatus().station+" to '"+wifi.getDetails().ssid+"'";
}
var httpsync=false;
function start(){
	var wifi=require("Wifi");
	console.log("Init wifi : "+wifiDetails(wifi));  
    
	if(wifi.getStatus().station==="connected") {
		console.log("ALREADY connected: "+wifiDetails(wifi));        
        wifi.setSNTP("us.pool.ntp.org",3);
		syncHTTPTime();
      
	} else {
		console.log("NOT YET connected: "+wifiDetails(wifi)); 
		wifi.on("connected", function () {
			console.log("NOW connected: "+wifiDetails(wifi)); 		
            wifi.setSNTP("us.pool.ntp.org",3);
			syncHTTPTime();
		});
	}
    var prev=Date();
    var inittime=prev;
    const dur=2000, min=0.9,max=1.1;
    const maxmonitortime=2*60*1000;
	var inter=setInterval(function(){
        var now=Date();
        var diffratio=(now.getTime()-prev.getTime())/dur;
       
        if(diffratio<min || diffratio>max) {
           if(httpsync) console.log("Clock synced through HTTP :"+Date().toString());
            else console.log("Clock synced "+Math.round((1-diffratio)*dur)+"ms through SNTP :"+Date().toString());
        }
        prev=now;
        if((now-inittime)>maxmonitortime) {
            clearInterval(inter);
        }
	},dur);
}

function syncHTTPTime(){
	var http = require("http");
	http.get("http://google.gr",function (res) {
            var da=res.headers["Date"];
            if( da ==='undefined') {console.log("No timestamp found");return 0;}
            var d= Date(Date(da).getTime()+3*60*60*1000);  // Timezone +3
            var l=  Date();
            var diff=l.getTime()-d.getTime();
            //console.log("diff:"+Math.round(diff)+"ms");
            var timeout=1*60*60*1000;
            if(diff<-timeout) {
                httpsync=true;
                setTime(d.getTime()/1000);
   //             console.log("setting internal clock to internet time : "+d.toString());
            } else console.log("Dismissed http time, too near : "+Math.round(diff)+"ms");
    });
};

//// sync on init
E.on("init",start);
save();
