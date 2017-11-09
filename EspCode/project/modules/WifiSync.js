/// Mem to update
//MemD memory usage : leave only http and Wifi cached in modules (tested both connected & disconnected)
//- module (code) = 	169 block 
//- sync peak ~  		192 block
//- async peak ~ 		288 block
//- code ~	188 block or 104 block
//- httpget 			118 block + 41 reply + 18 local vars
//- wifi onconnect 	34 block
//- timer 120s		70 block


exports.WifiSync = function(cb){
	var arg=this;
//	print("arg",arg);
	if(!arg.st) {
//		var sntpserver=;
		//E.setTimeZone(3);
		print(process.memory());
//		require("Wifi").setSNTP("gr.pool.ntp.org",2);
		print("WifiSync started ...",Date().toString());
		var ar={cb:cb,st:1};
		ar.req=require("http").get('http://google.gr', exports.WifiSync.bind(ar));			 
		ar.req.on('error',exports.WifiSync.bind({st:3}));
		
	} else if(arg.st==3){
		print("WifiSync - Socket error", cb);//  no callback ?
	} else if(arg.st==2){
		print("WifiSync - connection closed");print(process.memory());
	} else if (arg.st==1) {
		print(process.memory(),Date().toString());
		//print("req",arg.req);
		var tz=2;
		var res=cb;	
		res.on('close',exports.WifiSync.bind({st:2}));	
//		var v="";
		//	print("got page : ");
		var da=res.headers["Date"];
		//	print(da);
		if( da ==='undefined') {print("WifiSync - No timestamp found");return 0;} 
		var d= Date(Date(da).getTime()+tz*60*60*1000); 
		//	print(d.toString());

		var diff=Date().getTime()-d.getTime();
		//	print("diff:"+diff);
		var timeout=60*1000;

		arg.req.removeAllListeners();
		arg.req.end();
		arg.req=null;
		delete httpCRs;
		delete httpCRq;
//		cached objects 16 blocks		
//		unload typed function objects // should use new ? 
//		delete Date;
//		delete Math;

//		delete global['\u00ff'].HttpCC;

		// unload cached modules 
//		Modules.removeCached("http");
//		Modules.removeCached("Wifi");

		if(diff<-timeout) {
			httpsync=true;
			setTime((d.getTime())/1000);
			print("WifiSync - setting internal clock to internet time : "+Date().toString(),"diff",diff);
			arg.cb(-diff);
		} else {print("WifiSync - Dismissed http time, too near or earlier "+d.toString()+" :"+Math.round(diff)+"ms at "+Date().toString());arg.cb(0);}
		
	}

	



};


/*
exports.WifiSync = function(cb){
//	var sntpserver=;
	//E.setTimeZone(3);
	var tz=3;
	require("Wifi").setSNTP("gr.pool.ntp.org",3);
	print("WifiSync started ...");
	var req=require("http").get('http://google.gr', function(res) {
		res.on('close', function(data) {
			print("WifiSync - connection closed");print(process.memory());
		});
//		var v="";
		//	print("got page : ");
		var da=res.headers["Date"];
		//	print(da);
		if( da ==='undefined') {print("WifiSync - No timestamp found");return 0;}
		var d= Date(Date(da).getTime()+tz*60*60*1000); 
		//	print(d.toString());

		var diff=Date().getTime()-d.getTime();
		//	print("diff:"+diff);
		var timeout=1*60*60*1000;

		req.removeAllListeners();
		req.end();

		delete httpCRs;
		delete httpCRq;
// unload typed function objects // should use new ?
//		delete Date;
//		delete Math;

//		delete global['\u00ff'].HttpCC;

		// unload cached modules 
//		Modules.removeCached("http");
//		Modules.removeCached("Wifi");

		if(diff<-timeout) {
			httpsync=true;
			setTime((d.getTime())/1000);
			print("WifiSync - setting internal clock to internet time : "+Date().toString());
			cb(-diff);
		} else {print("WifiSync - Dismissed http time, too near or earlier : "+Math.round(diff)+"ms at "+Date().toString());cb(0);}

	});
	req.on('error', function(e) {
		print("WifiSync - Socket error", e);//  no callback ?
	});;

};


/*







var jp=JSON.parse;
/////////////////////////////////////////////////////
exports.getRuleHtml= function(rule,rules,nodes,neo){
	if(typeof(neo)==="undefined") neo=false;
//	console.log("neo ", neo);
	function getROpt(varn,tab,cv,rn) { // check memory use here
		var r="<select name="+varn;
		if(!neo) r+=" onChange='this.form.submit();'";
		r+=" form='"+rn+"'>";
//		print("inside tab:"+tab);
		for(var i=0;i<tab.length;i++){
			var e=tab[i];
			var sy="symb";
			if(e[sy]===undefined) sy="name";
			r+="<option value='"+e.name+"' ";
			if(e.name==cv) r+="selected ";
			//print("e.name:",e.name,", cv:",cv);
			r+=">"+e[sy]+"</option>";	
		}	
		return r+"</select>";
	};

	function getAction(t,vrn,vr,vln,vl,nds,rds,rn){
		if(t=="rule") nds=rds;
		var ret="<small>"+t+" </small>"+getROpt(vrn,nds, vr,rn);
		var comp=[{name:"0",symb:"Off"},{name:"1",symb:"On"}];
		ret+=getROpt(vln,comp,vl,rn);
		return ret;
	}

	function gNN(sin,sout,n){
		n=jp(n);
		for(var i=0;i<n.length;i++){
			var e=jp(n[i]);
			if(sout===undefined)  {sin.push({name:e.name}); }
			else {
				if(e.type==="input") sin.push({name:e.name}); 
				else if (e.type==="output") sout.push({name:e.name});	
			}
		}
	}

	function gHid(n,v,rn){
		var re="<input hidden " ;
		if(n!="submit") re+="name='"+n+"' value=" + v + "";
		else re+="type=submit ";
		return re+" form='"+rn+"'>";
	}
	function gCB(n,v,rn,b){
		var rt =gHid(n,v,rn)+"<input type='checkbox' onChange='this.form."+n+".value=1-this.form."+n+".value;";
		if(b) rt+="this.form.submit();";
		if (v == "1") rt += "' checked"; else rt+="'";
		return rt+" form='"+rn+"'>";
	}
	var tz=3 ; //timezone
//	print("getRuleHtml0.5-"+JSON.stringify(process.memory()));
	var rn=rule.name, rnn=gHid("rule",rn,rn), ar="<td style='text-align:center'>"+gCB("active",rule.active,rn,true)+"</td>"+ "<td >"+rn;
	//var rnn="<input hidden name='rule' form='"+rn+"' value=" + rn + ">" +ar + "<td >"+rn;
	if(neo) rnn="<td ><input type='text' name='rule' form='"+rn+"' value=" + rn + ">"+gHid("active",rule.active,rn),ar="";

//	console.log("neo ", neo);
//	console.log("rnn ", rnn);
	var rts="";
	if(rule.ts!=="-1" && rule.ts!==undefined) rts+="<small> : started "+(new Date(parseFloat(rule.ts-tz*3600000))).toString().split("GMT")[0]+"</small>";
//	console.log("started : "+(new Date(parseFloat(rule.ts-tz*60*60*1000))).toString().split("GMT")[0]);
	var ret = "<tr>";
	if(neo) ret="";
	ret+="<form method='get' id='"+rn+"'>"+ rnn+ar+gHid("type","rule",rn)+gHid("ctype",rule.ctype,rn) +rts+"</td><td >";rnn="";rts="";
	var ndsin=[];	// should be executed once per html page
	var ndsout=[];
	gNN(ndsin,ndsout,nodes);

	var rnam=[];
	gNN(rnam,undefined,rules);

	nodes=undefined;
	rules=undefined;

	if(rule.ctype=="timer") {ndsin=undefined;
		ret+="A1, wait :";
		ret+="<input type='text' name='t1' value="+rule.t1+" size=1 style='width:2em' form='"+rn+"'>&nbsp;";
		ret+="sec, A2. cycle :";
		ret+= gCB("cyc",rule.cyc,rn,false);

		if(rule.cyc=="1") ret+="<input type='text' name='t2' value="+rule.t2+" size=1 style='width: 2em' form='"+rn+"'>&nbsp;";
		ret+="</td><td> A1:"+gHid("acttype1",rule.acttype1,rn);
		ret+=getAction(rule.acttype1, "actvar1",rule.actvar1,"actval1",rule.actval1,ndsout,rnam,rn);
		ret+=" , A2:"+gHid("acttype2",rule.acttype2,rn)+getAction(rule.acttype2,"actvar2",rule.actvar2,"actval2",rule.actval2,ndsout,rnam,rn);

	} else {
		ret+="if "+getROpt("cvar",ndsin ,rule.cvar,rn);
		ndsin=undefined;
		var comp=[{name:"less",symb:"&#60;"},{name:"greaterorequal",symb:"&#8805;"}];
		ret+=getROpt("ccomp",comp,rule.ccomp,rn);
		ret+="<input type='text' name='cval' value="+rule.cval+" size=1 style='width:2em' form='"+rn+"'>&nbsp;";
		ret+="</td><td >then ";
		ret+=gHid("acttype",rule.acttype,rn)+getAction(rule.acttype, "actvar",rule.actvar,"actval",rule.actval,ndsout,rnam,rn);
	}
	ndsout=undefined;
	if(!neo) ret+=gHid("submit",rn,rn)+"</td><td><button type='submit' value='1' name='delete' onclick='this.form.submit()' form='" + rn + "'  > &#9760; </button>";
	else ret+="</td><td><input type=submit form='"+rn+"'></td>";

	ret+="</form>";
	if(!neo) ret+="</tr>";

//	console.log("before ret",ret);

//	print("rule html length:"+ret.length);
//	print("getRuleHtml-"+JSON.stringify(process.memory()));
//	print("getRuleHtml:ret length",ret.length);
//	print("getRuleHtml:ret size",E.getSizeOf(ret));
//	print("getRuleHtml:nsin size",E.getSizeOf(ndsin));
//	print("getRuleHtml:nsout size",E.getSizeOf(ndsout));
//	print("getRuleHtml2-"+JSON.stringify(process.memory()));

	return ret;
};
 */

