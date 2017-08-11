
var callbacks=new Array();
function onWifiConnected(f) {
	if(callbacks.length==0) require("Wifi").on("connected",wifiConnected);
	callbacks.push(f);
}

function removeWifiListener(f) {
	var i=callbacks.indexOf(f);
	if(i!=-1) callbacks.splice(i, 1);
	if(callbacks.length==0) require("Wifi").removeAllListeners("connected");
}

function wifiConnected(d) {
	callbacks.clone().forEach(function(f){f(d);});
}


function start (){
	var wifi=require("Wifi");

	var f1=function(){
		print("connected1 " );
		removeWifiListener(f1);
	};
	var f2=function(){
		print("connected2 " );
		removeWifiListener(f2);
	};
	var f3=function(){
		print("connected3 " );
//		removeWifiListener(f3);
	};
	var f4=function(){
		print("connected4 " );
		removeWifiListener(f4);
	};


	onWifiConnected(f1);
	onWifiConnected(f2);
	onWifiConnected(f3);
	onWifiConnected(f4);


}

E.on("init",start);
save();