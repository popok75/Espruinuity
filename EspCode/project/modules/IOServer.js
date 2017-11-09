
//IOServer memory usage :
//- 21 block for server socket
//- 19 block for first request
//leave only : http and Wifi cached in modules after destroyed



//https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_caption_test
//http://www.cleancss.com/html-beautify/
//http://www.textfixer.com/html/compress-html-compression.php

//var pagehead="<!DOCTYPE html><html><meta name='viewport' content='width=device-width, initial-scale=1.0'><style> .pure-table { border-collapse: collapse; border-spacing: 0; empty-cells: show; border: 1px solid #cbcbcb } .pure-table caption { color: #000; font: italic 85%/1 arial, sans-serif; padding: 1em 0; text-align: center } .pure-table td, .pure-table th { border-left: 1px solid #cbcbcb; border-width: 0 0 0 1px; font-size: inherit; margin: 0; overflow: visible; padding: .5em 1em } .pure-table td:first-child, .pure-table th:first-child { border-left-width: 0 } .pure-table thead { background-color: #e0e0e0; color: #000; text-align: left; vertical-align: bottom } .pure-table td { background-color: transparent } .pure-table-odd td, .pure-table-striped tr:nth-child(2n-1) td { background-color: #f2f2f2 } .pure-table-bordered td { border-bottom: 1px solid #cbcbcb } .pure-table-bordered tbody>tr:last-child>td { border-bottom-width: 0 } .pure-table-horizontal td, .pure-table-horizontal th { border-width: 0 0 1px; border-bottom: 1px solid #cbcbcb } .pure-table-horizontal tbody>tr:last-child>td { border-bottom-width: 0 } </style><link rel='icon' href='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' sizes='32x32'><head> <title>IOServer Espruino</title></head><body> <table class='pure-table pure-table-bordered pure-table-striped'> <caption> INPUTS</caption> <thead> <tr> <th class='pure-table th'>Sensor</th> <th class='pure-table th'>Value</th> </tr> </thead> <tbody> ";
/*const  linestart = "<tr>";
const  namestart="<td class='pure-table td'>";
const  nameend="</td>";
const  valuestart="<td class='pure-table td'>";
const  valueend= "</td> </tr>";
const  lineend="</tr>";

var docend="</tbody> </table></body></html>";*/

//ideas for next
//- memory/flash
//- testbed : write a module in memory, load a moduleless code, add module executed from flash
//- pbs upload
//- minify (modules.addCached() ?), client-cli
//- transfer/auto-transfer
//- modify webide
//- StringLoader
//- Bootloader preload
//- other
//- github/cloud for all sources I still have and save

var js=JSON.stringify;
var jp=JSON.parse;

exports.IOServer= function (arg1, arg2) {	
	
	

	if(!this.st) {
		arg1.srv = (require("http")).createServer(exports.IOServer.bind({st:1,o:arg1}));	  
		// this.onPageRequest.bind(this);
		// print(this.srv);
		arg1.srv.listen(80);
		//print(this.sck);
		print("IOServer - server listening : http://"+(require("Wifi")).getIP().ip+"/ or http://"+(require("Wifi")).getAPIP().ip+"/");
		return arg1;
	} else if(this.st==2){
		console.log("IOServer - Socket error", arg1);
	} else if(this.st==3){
		console.log("IOServer - connection closed");
	}
	else if(this.st==1){
		var req=arg1, res=arg2;

		
		
		print("----> Serving request : '"+req.url+"'");
		req.on('error', exports.IOServer.bind({st:2,o:this.o}));
		res.on('close', exports.IOServer.bind({st:3,o:this.o}));

//		req.on('error', function(e) {console.log("IOServer - Socket error", e);});
//		res.on('close', function(data) {console.log("IOServer - connection closed");});

		print("Server0-",process.memory());

		//res.writeHead(200, {'Content-Type': 'text/html', 'Link': '</favicon.ico>; rel="https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png"'});
		if(req.url=== "/favicon.ico") {res.writeHead(200, {'Content-Type': 'text/html', 'Link': '</favicon.ico>; rel="https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png"'});res.end(); print("favicon header sent and closed");return;}

		var u = url.parse(req.url, true);
		var a = u.query;
		print("query : "+js(a));
		if(a!==null) {
			if("rule" in a) { //update rule
				a.name=""+a.rule;
				delete a.rule;
				this.o.data.updateRule(a);
				print("updated rule "+a.name+" with "+a.name);
			}
			if("node" in a) { //update node
				this.o.data.request({event:"push", object:{name:a.node, val:a.val}});
				//		iod.updateNode();
				print("update request posted "+a.node+" with "+a.val);
			}
		}

		var p = u.pathname;
		//if log file, name need to be changed
		if(p.indexOf("/log")!=-1) p=exports.IOServer.bind({st:4})(p, this.o.fs);
		print("path",p);
		var q = this.o.fs.items[p];
		if (q) {
			console.log({match:p});
 			
			
	//		print("drain placed on",res);
			this.o.fs.pipe(p,res);
		} else {
			if ( p === '/json/nodes' ) {this.o.data.request({event:"pull",object:"*"});
			res.writeHead(200,{'Content-Type': 'application/json'});
			var d=this.o.data;
			//res.on('drain', function() {setTimeout(function(){print("served nodes");res.end(d.nodes);},1000);});
			res.end(d.nodes);
			return;
			}
			if ( p === '/json/rules' ) {
				res.writeHead(200,{'Content-Type': 'application/json'});
				res.end(this.o.data.rules);
				return;
			}

			console.log({   q : a,   p : p  });
			res.writeHead(404);
			res.end("404: Not found");
		}
		print("Server1-",process.memory());
	
	
	} else if(this.st==4) {
		var k=arg1, fs=arg2;
//		console.log("cfile",k);
		// find required number
		var ri=-1,cur="-cur";
		for(var i=0;i<k.length;i++) {if(k[i]=="/") ri=i;}
		if(ri<0) return "";
		var l=parseInt(k.substring(ri+1,k.length));
	//	console.log("cfile l",l);

		// find cur on disk
		var b=k.substring(0,ri+1);	
//		console.log("cfile b",b);
		var current="",max=0;
		var ia=fs.items;
		for(var it in ia){
				console.log("cfile it",it);
			if(it.indexOf(b)!=-1) {
				if(it.indexOf(cur)!=-1){
					current=it;
				}
				max++;
			}
		}
//		console.log("cfile current",current);
		if(current!="") {
			current= parseInt((current.replace(cur,"")).replace(b,""));
//			console.log("current",current);
		} else return "";

		var d=current-l;
		if(d<0 && max>current) d+=max;
		var ret=b+d;
		if(d==current) ret+=cur;
//		console.log("cfile ret",ret);

		var item=jp(ia[ret]),addr =parseInt(fs.addr + item.p * fs.page_size, 10);
		console.log("item",item);
		var offset=item.l;
		while(offset<fs.page_size){				//dichotomy faster
			var ix=require("Flash").read(8,addr+offset);
			print("oix",ix);
			var restart=-1;
			for(var i=7;i>=0;i--) if(ix[i]!= 0xFF) {restart=i;break;}
			if(restart!=-1) {offset+=8-(7-restart);}
			else break;
			console.log("restart",restart,offset);
		}
//		console.log("length",item.l,offset);
		if(offset>item.l) {item.l=offset;ia[ret]=js(item);console.log("length saved");}
		return ret;
	}
};





/*


function IOServer(idat,fs) { // usage 39 block

	this.data=idat;
	this.fs=fs;
};


IOServer.prototype.createServer=function() {
	this.srv = (require("http")).createServer(this.onPageRequest.bind(this));	  
	// this.onPageRequest.bind(this);
	// print(this.srv);
	this.srv.listen(80);
	//print(this.sck);
	print("IOServer - server listening : http://"+(require("Wifi")).getIP().ip+"/ or http://"+(require("Wifi")).getAPIP().ip+"/");

};

IOServer.prototype.onPageRequest=function(req, res) {
	var js=JSON.stringify;
	print("----> Serving request : '"+req.url+"'");
	req.on('error', function(e) {
		console.log("IOServer - Socket error", e);
	});
	res.on('close', function(data) {
		console.log("IOServer - connection closed");
	});

	print("Server0-"+js(process.memory()));

	//res.writeHead(200, {'Content-Type': 'text/html', 'Link': '</favicon.ico>; rel="https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png"'});
	if(req.url=== "/favicon.ico") {res.writeHead(200, {'Content-Type': 'text/html', 'Link': '</favicon.ico>; rel="https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png"'});res.end(); print("favicon header sent and closed");return;}

	var u = url.parse(req.url, true);
	var a = u.query;
	print("query : "+js(a));
	if(a!==null) {
		if("rule" in a) { //update rule
			a.name=""+a.rule;
			delete a.rule;
			this.data.updateRule(a);
			print("updated rule "+a.name+" with "+a.name);
		}
		if("node" in a) { //update node
			this.data.request({event:"push", object:{name:a.node, val:a.val}});
			//		iod.updateNode();
			print("update request posted "+a.node+" with "+a.val);

		}
	}

	var p = u.pathname;
	//if log file, name need to be changed
	if(p.indexOf("/log")!=-1) p=cFile(p, this.fs);
	print("path",p);
	var q = this.fs.items[p];
	if (q) {
		console.log({match:p});
		this.fs.pipe(p,res);
	} else {
		if ( p === '/json/nodes' ) {this.data.request({event:"pull",object:"*"});
		res.writeHead(200,{'Content-Type': 'application/json'});
		var d=this.data;
		//res.on('drain', function() {setTimeout(function(){print("served nodes");res.end(d.nodes);},1000);});
		res.end(d.nodes);
		return;
		}
		if ( p === '/json/rules' ) {
			res.writeHead(200,{'Content-Type': 'application/json'});
			res.end(this.data.rules);
			return;
		}

		console.log({   q : a,   p : p  });
		res.writeHead(404);
		res.end("404: Not found");
	}
	print("Server1-"+js(process.memory()));

};


function cFile(k,fs){

//	console.log("cfile",k);
	// find required number
	var ri=-1,cur="-cur";
	for(var i=0;i<k.length;i++) {if(k[i]=="/") ri=i;}
	if(ri<0) return "";
	var l=parseInt(k.substring(ri+1,k.length));
//	console.log("cfile l",l);

	// find cur on disk
	var b=k.substring(0,ri+1);	
	console.log("cfile b",b);
	var current="",max=0;
	var ia=fs.items;
	for(var it in ia){
		//	console.log("cfile it",it);
		if(it.indexOf(b)!=-1) {
			if(it.indexOf(cur)!=-1){
				current=it;
			}
			max++;
		}
	}
//	console.log("cfile current",current);
	if(current!="") {
		current= parseInt((current.replace(cur,"")).replace(b,""));
		console.log("current",current);
	} else return "";

	var d=current-l;
	if(d<0 && max>current) d+=max;
	var ret=b+d;
	if(d==current) ret+=cur;
	//console.log("cfile ret",ret);

	var addr = fs.address(ia[ret].page);
	var offset=0;
	var end=0;
	while(!end && offset<fs.page_size){				
		var ix=require("Flash").read(8,addr+offset);
		print("oix",ix);
		var restart=-1;
		for(var i=7;i>=0;i--) if(ix[i]!= 0xFF) {restart=i;break;}
		if(restart!=-1) {offset+=8-(7-restart);}
		else {end=true;}
//		console.log("restart",restart,offset);
	}
	console.log("length",ia[ret].length,offset);
	if(offset>ia[ret].length) ia[ret].length=offset;
	return ret;
};


exports = IOServer;
 */
///// proto local client

//create sensor
//subscribe sensor to server
//create relay
//subscribe relay

//start sensor reading


///// proto server

//subscribe new input
//subscribe new output 

//propagate changes to output 
//update output from rules & input

