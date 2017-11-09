

var jp=JSON.parse;

getPre=function(str){
	switch(str){
	case "preinput":  return  "<div><table class='pure-table' style='border: 0px'><caption>Inputs</caption><tr><td><table class='pure-table pure-table-bordered pure-table-striped'> <thead> <tr> <th >Input</th> <th >Value</th> </tr> </thead> <tbody>";break;
	case "preoutput":  return "<br><table class='pure-table pure-table-bordered pure-table-striped'> <thead> <caption>Outputs</caption><tr> <th >Output</th> <th >Value</th> </tr> </thead><tbody>";break;
	case "prerule":  return "<table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Rules</caption> <tr> <th>Active</th><th >Name</th><th >Condition</th> <th>Action</th> <th>Delete</th></tr> </thead><tbody>";break;
	case "neo":  return "<table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Add rule</caption></thead><tbody><tr><td>Name</td><td>";break; //Condition : <select onChange='changeRule(1,this.value)'><option value='compare'>Compare</option><option value='timer'>Timer</option></select></td><td>Action : <select onChange='changeRule(0,this.value)'><option value='node'>on Node</option><option value='rule'>on Rule</option></select></td><tr id=neo>

	}
};
var histShowed=0;
historyShow=function(){
	document.getElementById('histinput').innerHTML="";

	if(histShowed) {histShowed=0;return;}
	histShowed=1;
	console.log("Show history for inputs");
	loadScript("/js/graph.js",loadHistory,0,null);
	
};

function loadHistory(){
	console.log("LOAD HISTORY");
	var ns= jp(nodes);	
	for (var i = 0; i <ns.length; i++) {
		var e=jp(ns[i]);
		if(e.type=="input") {
			var name="/log/"+e.name+"/0";
			console.log("name:",name);
			//		"0, 0, 1, 95, 52, 52, 54, 79, 0, 0, 0, 60, 0, 220, 6";
			loadremote(name,loadh.bind(e.name),0,"arraybuffer");			
		}
	}
}

function loadScript(url,cb){
	script = d.createElement('script');
	script.type = 'text/javascript';
	script.async = true;
	script.onload = cb();
	script.src = url;
	d.getElementsByTagName('head')[0].appendChild(script);
}

function getFormattedDate(ts) 
{
 //   var week = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
//    var day  = week[today.getDay()];
	var d=new Date(ts);

    var dd   = d.getUTCDate();
    var mm   = d.getUTCMonth()+1; //January is 0!
    var yy = (d.getFullYear().toString()).substring(2,4);
//    var hour = today.getHours();
//    var minu = today.getMinutes();

    if(dd<10)  { dd='0'+dd; } 
    if(mm<10)  { mm='0'+mm; } 
//    if(minu<10){ minu='0'+minu; } 

    return /*day+' - '*/+dd+'.'+mm+'.'+yy+' '+d.toUTCString().substring(17,25);
    //var ds=d.getUTCDate()+"."+(d.getUTCMonth()+1)+"."+(d.getFullYear().toString()).substring(2,4)+" "+d.toUTCString().substring(17,25);
	
}

loadh=function(t){
	
	function intervert(s){
		return s.substring(6,8)+s.substring(2,6)+s.substring(0,2)+s.substring(8,s.length)
	}
	function sharedStart(array){
	//	console.log("array",array);
		var A=[];
		array.forEach(function(e){
			var dds=intervert(e.ds);
			A.push(dds);console.log("e",e,"dds",dds);});
	    A=A.sort();
	//    console.log(A);		    
	    var a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
	    while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
	    return a1.substring(0, i);
	}
	
	var n=this;
	function getNumber(arr,j,nu){
		var ret=0,m=1;
		for(var i=nu-1;i>=0;i--) {ret+=arr[j+i]*m;m=m*256;}
		return ret;
	}
	console.log("loadh",t,n);
	var dat = new Uint8Array(t);
	console.log("loaded",t,dat.length,dat);

	// make an array of streams of ts.value	
	// ts 8 bytes,interval 4 bytes, val 2 bytes, rep 1 byte
	console.log("ts:",getNumber(dat,1,7));
	console.log("interval:",getNumber(dat,8,4));
	console.log("val:",getNumber(dat,12,2));
	//console.log("rep:",getNumber(dat,14,1));

	// mode 0 : 1byte mod + 7byte ts + 4byte interval+ (2byte val + 1byte rep) 
	// mode 1 : 1byte mod + 7byte ts + 4byte interval+ (2byte val) 
	// mode 2 : 1byte mod + (7byte ts) start with v:0/off switch each ts 
	// mode 3 : 1byte mod + (7byte ts) start with v:1/on
	// mode 4 : 1byte mod + 7byte diff 

	var curts=0,inter;
	var index=0;
	var mv=0;
	var tab=[];	
	var tim=0;
	var newstream=1,ptabind=0;
	var end=0;
	while(!end)
	{
		if(newstream){
			var m=dat[index];index++;	// we are supposed to be at the beginning of the stream
			if(m<2) {
				curts=getNumber(dat,index,7);index+=7;
				inter=1000*getNumber(dat,8,4);index+=4;
			}
			mv=0;
			if(m==3) mv=1;
			console.log("mode",m);
			console.log("n",n);
			newstream=0;
		}
		var ns=1,e=1,i=0;
		for(;i<4;i++) {if(dat[index+i]!=0xFF) ns=0;}
		if(ns) for(;i<8;i++) {if(dat[index+i]!=0xFF) e=0;}
		console.log("ns",ns,"index",index);
		console.log("e",e);
		if(e && ns) {console.log("end too early");break;}

		
		
		if(ns || index>=dat.length) {
			// calculate common string	
			var sub=tab.slice(ptabind,tab.length);
			var shrd=sharedStart(sub);
			
			var sa=tab[tab.length-1].ds;
			console.log("sa",sa,ptabind);
			sub.forEach(function(e){
				var dds=intervert(e.ds);
				console.log("dds",dds);
				if(shrd.length>8) {e.ds=e.ds.substring(shrd.length,e.ds.length);}
				else {e.ds=e.ds.substring(8-shrd.length,e.ds.length);}				
			});
			console.log("shrd",shrd,"shrlength",shrd.length,"index",index,"tablength",tab.length);
			
			tab.push({n:"stream-end",shr:shrd,ds:sa});
			index+=4;
			newstream=1;
			ptabind=tab.length;
			if(ns) continue;
			else {end=1;break;}
			} 
		
		var val,rep=0,ts;
		if(m<2) {
			val=getNumber(dat,index,2)/10;index+=2;
			if(m==0) {rep=getNumber(dat,index,1);index++;}
			console.log("rep",rep);
			ts=curts+tim;
			tim+=inter*(rep+1);
		}
		else {val =mv;mv=1-mv;ts=getNumber(dat,index,7);index+=7;}

		console.log("curts",curts,ts,tim);
		var ds=getFormattedDate(ts);
		tab.push({ts:ts,v:val,r:rep+1,d:(new Date(ts)).toString(),ds:ds});

	} 	
	//console.log(tab);
	// choose a unit for time : display context on first line, only smaller unit next
	//console.log(tim/inter);

	// find unit
	var ns= jp(nodes);
//	console.log(ns);
	var unit="";
	for (var i = 0; i <ns.length; i++) {
		var e=jp(ns[i]);
		if(e.name==n) unit=e.unit;
	}

	// make a table to show data
	var htab="<table class='pure-table pure-table-bordered pure-table-striped' style='font-size:80%'>";
	htab+="<caption>"+n+"</caption>";
	var pad="style='padding-top:0.1em !important;padding-bottom:0.1em !important;";	//TODO must be a better way
			
	var lrow=10;
	var lcol=10;
	for(var i=0;i<lrow;i++) {
		htab+="<tr>";
		//	console.log("row",i);
		for(var j=0;j<lcol;j++) {
			var ind=i+j*lrow;
			//	console.log("col",j);
			if(ind<tab.length){
				var item=tab[tab.length-ind-1];
				var bor="";
//				console.log("J",j);
				if(j>0) bor+="border-left:2px solid #cbcbcb !important;";
				if(item.n) {htab+="<td colspan=2 "+pad+bor+"white-space:nowrap;text-align: center;font-weight: bold;font-style: italic;'>"+item.ds+"</td>";//"<td "+pad+"'><span style='font-weight: bold;'>"+"</span>"+"</td>";
				}else {
					var d=new Date(item.ts);
					console.log("item.ts",item.ts);
					//var ds=d.getUTCDate()+"."+(d.getUTCMonth()+1)+"."+(d.getFullYear().toString()).substring(2,4)+" "+d.toUTCString().substring(17,25);
					var ds=item.ds;
					console.log("ds",ds,d.toString());
					htab+="<td "+pad+bor+"white-space:nowrap;'>"+ds;
					console.log("item",item);
					if(item.r>1) htab+=" * "+item.r;
					var nun=unit;
					if(item.v==6553.5) {item.v="-";nun="";}
					htab+="</td><td "+pad+"'><span style='font-weight: bold;'>"+item.v+"</span>"+nun+"</td>";		
				}
			} //else console.log("ind too big",ind,tab.length);
			//	console.log("htab",htab);
		}
		htab+="</tr>";

	}
	/*	for(var i=0;i<tab.length;i++){	
		var d=new Date(tab[i].ts);
		var ds=d.getDay()+"."+d.getMonth()+"."+(d.getFullYear().toString()).substring(2,4)+" "+d.toString().substring(16,24);
		htab+="<tr><td "+pad+">"+ds+"</td><td "+pad+">"+tab[i].v+"</td></tr>";
	}*/
	htab+="</table>";
//	show table
	document.getElementById('histinput').innerHTML+=htab;
};



















writeTable=function(type, nodes, nnodes){

	var post="</tbody> </table>";
	console.log("type",type);
	if(type=="input") post+="</td><td style='vertical-align:top !important;border-left: 0px' id=inputHist><button style='vertical-align:top;font-size:75%' type='button' onclick='historyShow()' > History </button><br><div id='histinput'></div></td></tr></table>";//<div style='display: inline-block;vertical-align: middle;'></div><div>";
	var towrite=getPre("pre"+type);	

//	console.log(nodes);
	var ns= jp(nodes);
//	console.log(ns);
	for (var i = 0; i <ns.length; i++) {
		var e=jp(ns[i]);
		//	print("type:",e.type,type);
		//	print("elem",e);
//		print("writeTable 4 -"+JSON.stringify(process.memory()));

		if(e.type==type) {
			var nh="";

			if (e.type=="rule")  nh+=getRuleHtml(e,nodes,nnodes);
			else nh+=getNodeHtml(e);

			towrite+=nh;

		}
		//	print("NodeHtml:",i,ns.length);
	}

	towrite+=post;

//	print("sent html:"+towrite.length);

	return towrite;
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////

getNodeHtml = function(e){
	var  linestart = "<tr>",namestart="<td>",nameend="</td>",valuestart="<td style='text-align: center'>",valueend= "</td>",lineend="</tr>";

	function getForm(e){
		var r="<input type='radio' name='val' value='1'";
		var r2="> On <input type='radio' name='val' value='0' ";
		if(e.val==0) {r+="onChange='this.form.submit();'";r2+="checked";}else {r2+="onChange='this.form.submit();'";r+="checked";}		
		r2+="> Off";	

		return r+r2;	
	};

//	var docend="</tbody> </table></body></html>";
//	console.log("getInput::this: "+JSON.stringify(this));
//	console.log("getInput::this.inputs: "+JSON.stringify(this.inputs));
	var ret="";
	ret+=linestart;
	ret+=namestart;
	ret+=e.name;
	ret+=nameend;
	ret+=valuestart;
	if(e.type==="output") {ret+="<form method='get' id='output'><input type='hidden' name='node' value="+e.name+">"+getForm(e)+"</form>";
	}else {ret+=e.val;ret+=e.unit;}
	ret+=valueend;
	ret+=lineend;
	return ret;
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


getRuleHtml= function(rule,rules,nodes,neo){
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





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

addRule = function( rules, nodes){	//pb using dynamic change of form
	function gNN(s1,s2,n){
		n=jp(n);
		for(var i=0;i<n.length;i++){
			var e=jp(n[i]);var en={name:e.name};
			if(s2===0)  s1.push(en); 
			else {if(e.type==="input") s1.push(en); 
			else if (e.type==="output") s2.push(en);}	
		}
	};
	getDef=function(cond,act){
		function ctn(s,m){for(i=0;i<m.length;i++) {if(m[i].name==s) return true;} return false;};
		var s1=[],s2=[],am=[], gn="NewRule",w={name:gn, type:"rule", active:"0"},i,j=2;
		gNN(am,0,rules);
		gNN(s1,s2,nodes);	
		var s0=s2[0].name, am0=am[0].name;
		while(ctn(w.name,am)) w.name=gn+j,j++;
//		for(i=0;i<am.length;i++)if(am[i].name==w.name) w.name+=""+j; 
		if(cond=="compare")
		{ 	var w2={ctype:"compare",cvar:s1[0].name,ccomp:"greaterorequal",cval:"85",actval:"0"};
		for (var a in w2) { w[a] = w2[a]; }	
		if(act=="node") {w.acttype="node";w.actvar=s0;
		} else {w.acttype="rule";w.actvar=am0;}
		}
		else {var w2={ctype:"timer",ts:"-1",t1:"25",t2:"10:00",cyc:"1",actval1:"0",actval2:"0"};
		for (var a in w2) { w[a] = w2[a]; }
		if(act=="node") {w.acttype1=w.acttype2="node";w.actvar1=s0;w.actvar2=s0;
		} else {w.acttype1=w.acttype2="rule";w.actvar1=am0;w.actvar2=am0;}
		}
		if(rn.name!==undefined) {
			console.log("found previous",rn);
			w.name=rn.name;
			if(cond=="compare" && rn.ctype==cond) {	w.cvar=rn.cvar;w.ccomp=rn.ccomp;w.cval=rn.cval;w.actval=rn.actval;} 
			if(cond=="timer" && rn.ctype==cond) {w.t1=rn.t1;w.t2=rn.t2;w.cyc=rn.cyc;w.actval1=rn.actval1;w.actval2=rn.actval2;}
		}
		return w;
	};

	changeRule=function(v){
		var u=false,c=0, doc=document.getElementById("neo");
		if(v=="compare" || v=="timer") c=1;
		if(doc!==null) {
			rn ={ctype:sa};
			if(sa=="timer") rn.acttype1=sb,rn.acttype2=sb;
			else rn.acttype=sb;
			var ess = doc.firstChild.elements;
			for(var i = 0 ; i < ess.length ; i++){
				var it = ess.item(i);
				if(it.name=="rule") rn["name"] = it.value;
				else rn[it.name] = it.value;					
			}
//			console.log("updated rn",rn);
		}
		if(c==1 && v!=sa) {sa=v;u=true;} 
		if(c==0 && v!=sb) {sb=v;u=true;}
		if(u){
			rn=getDef(sa,sb); 
			document.getElementById("neo").innerHTML=getRuleHtml(rn, rules, nodes, true);
		}
	};

	function gOpt(v,t,v2,t2){
		function gO(b,y){return "<option value='"+b+"'>"+y+"</option>";}
		return "<select onChange='changeRule(this.value)'>"+gO(v,t)+gO(v2,t2)+"</select>";
	};
	var ret=getPre("neo");
	ret+="Condition : "+gOpt("compare","Compare","timer","Timer")+"</td><td>Action : "+gOpt("node","Node","rule","Rule")+"</td><tr id=neo>";
	sa="compare";sb="node";	rn={};
	rn=getDef(sa,sb);
//	console.log("before rulehtml");
	ret+=getRuleHtml(rn, rules, nodes, true); // make name editable, no on change events and add a submit button, no activate field
	ret+="</tr></table>";
	return ret;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


show = function() {


	console.log(nodes);
	console.log(rules);

//	nodes=document.getElementById('nodes').textContent;
//	rules=document.getElementById('rules').textContent;
	nodes=nodes.replace("\\\\xB0","&#176;");
	var t=writeTable("input",nodes);
//	document.getElementById('debug').innerHTML+="nodes ok"+"<br>";

//	console.log(t);
	t+=writeTable("output",nodes);
//	document.getElementById('debug').innerHTML+="output ok"+"<br>";
//	console.log(t);
	t+=writeTable("rule",rules,nodes);
//	document.getElementById('debug').innerHTML+="rule ok"+"<br>";
	t+=addRule( rules, nodes);
//	document.getElementById('debug').innerHTML+="addrule ok"+"<br>";
//	console.log(t);	
	document.getElementById('data').innerHTML=t;

};



loadremote=function(addr,cb,ret,type){
	var maxretry=10;
	if(!ret) ret=0; 
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
//		document.getElementById('debug').innerHTML+="got :"+addr+" "+this.status+","+this.readyState+"<br>";
//		document.getElementById('debug').innerHTML+=JSON.stringify(xhttp)+"<br>";
		if (this.readyState == 4 && this.status == 200) {
			if(type) cb(xhttp.response);
			else cb(xhttp.responseText);
		}else 
			if(this.readyState == 4 && this.status==0) {

				document.getElementById('debug').innerHTML+="status:"+this.status+", readyState "+this.readyState; 
				document.getElementById('debug').innerHTML+="reload again"+addr+"<br>"+"retries:"+ret;ret++; 
				if(ret<maxretry) setTimeout(function(){loadremote(addr,cb,ret,type);},200);
				else cb(null);}
	};
//	xhttp.open("GET", "https://api.myjson.com/bins/valu9", true);
	xhttp.open("GET", addr, true);
	if(type) {xhttp.responseType = type;console.log("asked for binary",addr);}
	console.log("loadremote type",addr,type);
	xhttp.send();
//	document.getElementById('debug').innerHTML+="asking "+addr+"<br>";
};

window.onload = function() {

	loadremote("/json/nodes",function(t){
		nodes=t;
		loadremote("/json/rules",function(t){
			rules=t;
			show();
		},null);
	},null);}
/*
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		document.getElementById('debug').innerHTML+="got nodes :"+this.status+","+this.readyState+"<br>";
		document.getElementById('debug').innerHTML+=JSON.stringify(this);
		if (this.readyState == 4 && this.status == 200) {
			// Typical action to be performed when the document is ready:
			nodes = xhttp.responseText;
			document.getElementById('debug').innerHTML+="asking rules"+"<br>";
			var xhttp2 = new XMLHttpRequest();
			xhttp2.onreadystatechange = function() {
				document.getElementById('debug').innerHTML+="got rules :"+this.status+","+this.readyState+"<br>";
				document.getElementById('debug').innerHTML+=JSON.stringify(this);
				if (this.readyState == 4 && this.status == 200) {

					// Typical action to be performed when the document is ready:
					rules = xhttp2.responseText;
					show();
				}
			};
//			xhttp2.open("GET", "https://api.myjson.com/bins/1ech75", true);
			xhttp2.open("GET", "/json/rules", true);
			xhttp2.send();
			document.getElementById('debug').innerHTML+="asking rules sent"+"<br>";
		}
	};
//	xhttp.open("GET", "https://api.myjson.com/bins/valu9", true);
	xhttp.open("GET", "/json/nodes", true);
	xhttp.send();
	document.getElementById('debug').innerHTML+="asking nodes"+"<br>";

 */








