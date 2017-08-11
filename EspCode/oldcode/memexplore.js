	  


var func= function(){
  print(process.memory());
};

function funz(){
  print(process.memory());
};
funz();

var ht=require("http");
func();
//var req=
    ht.get('http://google.gr');
func();
//req.end();
//req.removeAllListeners();
Modules.removeAllCached();
//req=null;
delete req;
delete httpCRs;
delete httpCRq;
var v="\xFF"
delete global[v].HttpCC;
//delete HttpCC;
/*
 * require("Flash").read(100, 0x08000000)
 * 
 * 
 * 
 var FS=require("FlashString");
 FS.load("test4");
 require("FlashString").load("bug");
 
 
 * 
  print(process.memory());
E.getSizeOf(global, 1);
JSON.stringify(E.getSizeOf(global, 2));
E.getSizeOf(global["\xFF"], 1);
E.getSizeOf(global["\xFF"], 2)
E.getSizeOf(global["\xFF"].modules, 2)
 global["\xFF"].history=[]
 E.getSizeOf(global["\xFF"].modules,1);

Modules.removeAllCached();
Modules.removeCached("MemF");

Modules.removeCached("http");
require("http").get("http://www.espruino.com",function(res){print("RECEIVED HTTP");});


*
*
*
*/

func();
func();
func();
func();
func();
func();
//var client = require("net").connect({host: "google.gr", port: 80}, function() {});
func();

//setInterval(function(){Modules.removeAllCached();print(process.memory());},2000);
/*
function fun2(){require("http").get('http://google.gr',function(){print(process.memory());});};
function f3(){require("http").get('http://google.gr',func);};


/*
function sync(){
      /*  var http=require("http");
		var req;
		function listr(res){
			print(process.memory());

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
			print(process.memory());
		}
	/*	  var options = {
				    host: 'http://google.gr',
				    port: '80',
				    path:'/',
				    method:'GET'
				  };*/
		//  require("http").request(options, listr).end();
		 // req=
 /*           require("http").get('http://google.gr',function(){});
  
}/*
console.log("MEM 1");
print(process.memory());
var ht=require("http");
console.log("MEM 2");
print(process.memory());
/*var req=ht.get('http://google.gr',function(){});
console.log("MEM 3");
print(process.memory());
req.end();
req.removeAllListeners();
req=0;
ht=0;
console.log("MEM 4");
print(process.memory());
*/
//sync();
