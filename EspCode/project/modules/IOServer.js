
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

// ideas for next
//		- memory/flash
//			- testbed : write a module in memory, load a moduleless code, add module executed from flash
//			- pbs upload
//				- minify (modules.addCached() ?), client-cli
//				- transfer/auto-transfer
//				- modify webide
//			- StringLoader
//			- Bootloader preload
//		- other
//			- github/cloud for all sources I still have and save



function IOServer(idat) { // usage 39 block
	// 3 arrays
	//		- inputs
	//		- outputs
	//		- rules
	this.data=idat;

//	var mythis=this;
//	var srv;
};
exports = IOServer;

IOServer.prototype.createServer=function() {
	this.srv = (require("http")).createServer(this.onPageRequest.bind(this));	  
	// this.onPageRequest.bind(this);
	// print(this.srv);
	this.srv.listen(80);
	//print(this.sck);
	print("IOServer - server listening : http://"+(require("Wifi")).getIP().ip+"/ or http://"+(require("Wifi")).getAPIP().ip+"/");

};

IOServer.prototype.onPageRequest=function(req, res) {
	print("----> Serving request : '"+req.url+"'");

	this.requestProcess(req,res);
	print("M5-"+JSON.stringify(process.memory()));
	
};
var js=JSON.stringify;
var jp=JSON.parse;


IOServer.prototype.requestProcess=function(req,res){
	print("P-2-"+JSON.stringify(process.memory()));
	
	res.writeHead(200, {'Content-Type': 'text/html', 'Link': '</favicon.ico>; rel="https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png"'});
	if(req.url=== "/favicon.ico") {res.end(); print("favicon header sent and closed");return;}

	var a = url.parse(req.url, true).query;
	print("query : "+JSON.stringify(a));
	if(a!==null) {
		if("rule" in a) { //update rule
			this.data.updateRule(a.rule,a.cvar,a.ccomp,a.cval,a.actvar,a.actval);
			print("updated rule "+a.rule);
		}
		if("node" in a) { //update rule
			this.data.updateNode(a.node, "val", a.val);
			print("updated "+a.node+" with "+a.val);
		}
	}
	print("P-1-"+JSON.stringify(process.memory()));
	
	
	// HTML Header and CSS
//	res.write("<!DOCTYPE html><html><head><style> .pure-table{border-collapse:collapse;border-spacing:0;empty-cells:show;border:1px solid #cbcbcb}.pure-table caption{color:#000;font:italic 85%/1 arial,sans-serif;padding:1em 0;text-align:center}.pure-table td,.pure-table th{border-left:1px solid #cbcbcb;border-width:0 0 0 1px;font-size:inherit;margin:0;overflow:visible;padding:.5em 1em}.pure-table td:first-child,.pure-table th:first-child{border-left-width:0}.pure-table thead{background-color:#e0e0e0;color:#000;text-align:left;vertical-align:bottom}.pure-table td{background-color:transparent}.pure-table-odd td,.pure-table-striped tr:nth-child(2n-1) td{background-color:#f2f2f2}.pure-table-bordered td{border-bottom:1px solid #cbcbcb}.pure-table-bordered tbody>tr:last-child>td{border-bottom-width:0}.pure-table-horizontal td,.pure-table-horizontal th{border-width:0 0 1px;border-bottom:1px solid #cbcbcb}.pure-table-horizontal tbody>tr:last-child>td{border-bottom-width:0} h1{font-size:1.75em;margin:.67em 0;} body{font-family:FreeSans,Arimo,'Droid Sans',Helvetica,Arial,sans-serif;}</style><meta name='viewport' content='width=device-width, initial-scale=1.0'><link rel='icon' href='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' sizes='32x32'></head><body><h1>IOServer v0.01</h1><table class='pure-table pure-table-bordered pure-table-striped'> <thead>	<tr><th class='pure-table th' >Sensor</th>	<th class='pure-table th'>Value</th></tr></thead>   <tbody>");
	res.write("<!DOCTYPE html><html><head> <style> .pure-table { border-collapse: collapse; border-spacing: 0; empty-cells: show; border: 1px solid #cbcbcb } .pure-table caption {color:#888;font:italic 125%/1 Helvetica, sans-serif;padding:.5em 1;text-align: center} .pure-table td, .pure-table th { border-left: 1px solid #cbcbcb; border-width: 0 0 0 1px; font-size: inherit; margin: 0; overflow: visible; padding: .5em 1em } .pure-table td:first-child, .pure-table th:first-child { border-left-width: 0 } .pure-table td { background-color: transparent } .pure-table-odd td, .pure-table-striped tr:nth-child(2n-1) td { background-color: #f2f2f2 } .pure-table-bordered td { border-bottom: 1px solid #cbcbcb } .pure-table-bordered tbody>tr:last-child>td { border-bottom-width: 0 } h1 { font-size: 1.75em; margin: .67em 0; } body { font-family: FreeSans, Arimo, 'Droid Sans', Helvetica, Arial, sans-serif; } </style> <meta name='viewport' content='width=device-width, initial-scale=1.0'><link rel='icon' href='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' sizes='32x32'></head><body> <h1>IOServer v0.01</h1> <table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Inputs</caption> <tr> <th class='pure-table th'>Input</th> <th class='pure-table th'>Value</th> </tr> </thead> <tbody>");
//	res.write("<!DOCTYPE html><html><body><h1>IOServer v0.01</h1><table class='pure-table pure-table-bordered pure-table-striped'> <thead>	<tr><th class='pure-table th' >Sensor</th>	<th class='pure-table th'>Value</th></tr></thead>   <tbody>");	
	print("P0-"+JSON.stringify(process.memory()));
	
	
	// INPUTS
	var ns= JSON.parse(this.data.nodes);
	for (var i = 0; i <ns.length; i++) {
		var e=JSON.parse(ns[i]);
		if(e.type=="input") res.write(this.getNodeHtml(e));
	}
	print("P1-"+JSON.stringify(process.memory()));
	
	// OUTPUTS
	res.end("</tbody> </table><br><table class='pure-table pure-table-bordered pure-table-striped'> <thead> <caption>Outputs</caption><tr> <th class='pure-table th'>Output</th> <th class='pure-table th'>Value</th> </tr> </thead><tbody>");
	for (var i = 0; i <ns.length; i++) {
		var e=JSON.parse(ns[i]);
		if(e.type=="output") res.write(this.getNodeHtml(e));
	}
//	res.end("</tbody> </table><br>&emsp;&emsp;<img src='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' alt='IOSERVER' style='width:120px;'></body></html>");
	print("P2-"+JSON.stringify(process.memory()));
	
	// RULES
	res.write("</tbody></form> </table><br><table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Rules</caption> <tr> <th class='pure-table th'>Rule</th><th class='pure-table th'>If</th> <th class='pure-table th'>Then</th> </tr> </thead><tbody>");
	var rs= jp(this.data.rules);
	for (var i = 0; i <rs.length; i++) {
		print ("rule :"+JSON.stringify(rs[i])); 
		res.write(this.getRuleHtml(res,jp(rs[i])));
	}
	print("M2-"+JSON.stringify(process.memory()));
	res.write("</tbody> </table>");
	print("M3-"+JSON.stringify(process.memory()));
	if(require("Wifi").getStatus().station==="connected") res.write("<br>&emsp;&emsp;<img src='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' alt='IOSERVER' style='width:120px;'>");
	res.end("</body></html>");
	print("M4-"+JSON.stringify(process.memory()));
	
};
 

IOServer.prototype.destroy=function() {
	this.srv.close();
	delete this.srv;
	delete httpSrv;
	var v="\xFF";
	delete global[v].HttpS;
};

IOServer.prototype.getRuleHtml=function(res,rule){

	function getROpt(varn,tab,type,cv) {
		var r="<select name="+varn+" form=rules onChange='this.form.submit();'>";
		//	print("inside tab:"+tab);
		tab.forEach(function(e) {
			var sy="symb";
			if(e[sy]===undefined) sy="name";
			r+="<option value='"+e.name+"' ";
			if(e.name==cv) r+="selected ";
			r+=">"+e[sy]+"</option>";
		});
		return r+"</select>";
	};

	res.write("<tr><form action='/' method='get' id='rules'><td class='pure-table td'>"+rule.name+": <input type='hidden' name='rule' value="+rule.name+"></td><td class='pure-table td'>if ");
	
	
	var ndsin=[];
	var ndsout=[];
	jp(this.data.nodes).forEach(function(e) {
		e=jp(e);
		if(e.type==="input") ndsin.push({name:e.name}); 
		else if (e.type==="output") ndsout.push({name:e.name});
		});
	
	print("ndsin:"+JSON.stringify(ndsin));
	
	
	
	res.write(getROpt("cvar",ndsin, "input",rule.cvar));
	var comp=[{name:"less",symb:"&#60;"},{name:"greaterorequal",symb:"&#8805;"}];
	res.write(getROpt("ccomp",comp,undefined,rule.ccomp));
	res.write("<input type='text' name='cval' value="+rule.cval+" size=1 style='width: 2em'>&nbsp;");

	
	
	res.write("</td><td class='pure-table td'>then ");
	res.write(getROpt("actvar",ndsout, "output", rule.actvar));
	comp=[{name:"0",symb:"Off"},{name:"1",symb:"On"}];
	res.write(getROpt("actval",comp,undefined,"val",rule.actval,"symb"));

	res.write("</td></tr></form>");
	print("M-"+JSON.stringify(process.memory())); 	
};

IOServer.prototype.getNodeHtml=function(e){
	const  linestart = "<tr>";
	const  namestart="<td class='pure-table td'>";
	const  nameend="</td>";
	const  valuestart="<td class='pure-table td' style='text-align: center'>";
	const  valueend= "</td>";
	const  lineend="</tr>";

//	var docend="</tbody> </table></body></html>";
//	console.log("getInput::this: "+JSON.stringify(this));
//	console.log("getInput::this.inputs: "+JSON.stringify(this.inputs));
	var ret="";
	ret+=linestart;
	ret+=namestart;
	ret+=e.name;
	ret+=nameend;
	ret+=valuestart;
	if(e.type==="output") {ret+="<form action='/' method='get' id='output'><input type='hidden' name='node' value="+e.name+">"+this.getForm(e)+"</form>";
	}else {ret+=e.val;ret+=e.unit;}
	ret+=valueend;
	ret+=lineend;
	return ret;
};

IOServer.prototype.getForm=function(e){
	var r="<input type='radio' name='val' value='1'";
	var r2="> On <input type='radio' name='val' value='0' ";
	if(e.val==0) {r+="onChange='this.form.submit();'";r2+="checked";}else {r2+="onChange='this.form.submit();'";r+="checked";}		
	r2+="> Off";	

	return r+r2;	


};




/*





	this.getPage=function () {
	//	console.log("getPage::this: "+JSON.stringify(this));

		var ret="";
	//	ret+=this.inputs.length;
		var arrayLength = this.inputs.length;
		for (var i = 0; i < arrayLength; i++) {
			ret+=this.getInput(i);		
			}

		ret+=docend;
		return ret;
	};


	function showError(response) {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found\n");
		response.end();
		return; 
	}

	function showJSON(response,obj) {
		 response.writeHead(200, {
             'Content-Type': 'text/html',
             'Access-Control-Allow-Origin' : '*'});
		response.write(JSON.stringify(obj));
		response.end();
		return; 
	}

	this.onPageRequest=function(req, res) {
		console.log("---->Serving request :"+req.url);

	//	console.log(JSON.stringify(mythis));

		if(req.url==="/data.json") {
				console.log("showing json for url:"+req.url);
				showJSON(res, mythis.inputs);
				return ;
		}


	//	console.log("url:'"+req.url+"'");
/*
		if(req.url==="/") {}
			else {
				console.log("no url:"+req.url);
				showError(res);
				return ;}
 * /	
		var a = url.parse(req.url, true);


	//	console.log("query:"+JSON.stringify(a));

		// here use input arguments

		res.writeHead(200, {'Content-Type': 'text/html'});
//		res.write("<!DOCTYPE html><html><meta name='viewport' content='width=device-width, initial-scale=1.0'><style> .pure-table { border-collapse: collapse; border-spacing: 0; empty-cells: show; border: 1px solid #cbcbcb } .pure-table caption { color: #000; font: italic 85%/1 arial, sans-serif; padding: 1em 0; text-align: center } .pure-table td, .pure-table th { border-left: 1px solid #cbcbcb; border-width: 0 0 0 1px; font-size: inherit; margin: 0; overflow: visible; padding: .5em 1em } .pure-table td:first-child, .pure-table th:first-child { border-left-width: 0 } .pure-table thead { background-color: #e0e0e0; color: #000; text-align: left; vertical-align: bottom } .pure-table td { background-color: transparent } .pure-table-odd td, .pure-table-striped tr:nth-child(2n-1) td { background-color: #f2f2f2 } .pure-table-bordered td { border-bottom: 1px solid #cbcbcb } .pure-table-bordered tbody>tr:last-child>td { border-bottom-width: 0 } .pure-table-horizontal td, .pure-table-horizontal th { border-width: 0 0 1px; border-bottom: 1px solid #cbcbcb } .pure-table-horizontal tbody>tr:last-child>td { border-bottom-width: 0 } </style><link rel='icon' href='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' sizes='32x32'><head> <title>IOServer Espruino</title></head><body> <table class='pure-table pure-table-bordered pure-table-striped'> <caption> INPUTS</caption> <thead> <tr> <th class='pure-table th'>Sensor</th> <th class='pure-table th'>Value</th> </tr> </thead> <tbody>");
		var p=mythis.getPage();
        res.end(p);

	};
	this.createServer=function() {
		var http = require("http");
		var srv=http.createServer(this.onPageRequest).listen(80);
		console.log("IOServer - server listening : http://"+(require("Wifi")).getIP().ip+"/ or http://"+(require("Wifi")).getAPIP().ip+"/");
	//	require("Wifi").startAP("Espruino");
	/*	var net=require('net');
		function callbackdata(data) {
			  console.log({data:data});
			}
		net.createServer(callbackdata).listen(8080);
		console.log("IOServer - server listening2 : http://"+(require("Wifi")).getIP().ip+"/ or http://"+(require("Wifi")).getAPIP().ip+"/");
 * /		
	};*/

//}



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

