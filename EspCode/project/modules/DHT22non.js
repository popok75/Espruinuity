/* Copyright (C) 2014 Spence Konde. See the file LICENSE for copying permission. */
/*
This module interfaces with a DHT22 temperature and relative humidity sensor.
Usage (any GPIO pin can be used):

var dht = require("DHT22").connect(C11);
dht.read(function (a) {console.log("Temp is "+a.temp.toString()+" and RH is "+a.rh.toString());});

the return value if no data received: {"temp": -1, "rh": -1, err:true, "checksumError": false}
the return value, if some data is received, but the checksum is invalid: {"temp": -1, "rh": -1, err:true, "checksumError": true}
 */

 
exports.DHT22= function (pin,cb) {	
	var o2=this;
	if(!o2.st){
		var n;
		if (!o2.cb) n=10;
		else {n=o2.n;pin=o2.p;cb=o2.cb;}
		var o={n:n,d:"",st:1};
	//	print("pin",pin,o.p,typeof(pin));
	//	print("o2",o2);
		// var ht = this;
		pinMode(pin); // set pin state to automatic
		digitalWrite(pin, 0);
		o.watch = setWatch(exports.DHT22.bind(o),pin, {edge:'falling',repeat:true});
		setTimeout(exports.DHT22.bind({st:2}),1,pin);
		setTimeout(exports.DHT22.bind({st:3,o:o}),100,pin,cb);
		//setTimeout(exports.DHT22.bind({n:n-1,cb:cb}),50);		
	} else if(o2.st==1){var t=pin;
		o2.d+=0|(t.time-t.lastTime>0.00005);
	} else if(o2.st==2){
		pinMode(pin,'input_pullup');
	} else if(o2.st==3){
//		print("o2",o2);
		var ht=o2.o;
		var d=ht.d;
		delete ht.d;
		clearWatch(ht.watch);
		delete ht.watch;
		var cks = 
			parseInt(d.substr(2,8),2)+
			parseInt(d.substr(10,8),2)+
			parseInt(d.substr(18,8),2)+
			parseInt(d.substr(26,8),2);
		if (cks&&((cks&0xFF)==parseInt(d.substr(34,8),2))) {
			delete ht.n;
			cb({ 
				raw : d,
				rh : parseInt(d.substr(2,16),2)*0.1,
				temp : parseInt(d.substr(19,15),2)*0.2*(0.5-d[18])
			});
		} else {//print("ht",ht);
			if (ht.n>1) setTimeout(exports.DHT22.bind({n:ht.n-1,cb:cb,p:pin}),500);
			else cb({err:true, checksumError:cks>0, raw:d, temp:-1, rh:-1});
		}
	}
};

