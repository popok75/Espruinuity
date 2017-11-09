
//IOData memory usage : 
//- module (code) = 52 block
//- execution ~   block
//- 60 block when creating object
//- 10 block for the array of data
//- data array = 4 + 13 block per ionode
//- left after first execution
//- 5 blocks for module prototype declaration 
//- 6 blocks for Array on global scope

//string take less mem than arrays
//argyuments take the most space in function delaration mem
/*
//objects

function IORule(r){
	this.name=r.name;
	this.cvar=r.cvar;
	this.ccomp=r.ccomp;
	this.cval=r.cval;	
	this.actvar=r.actvar;
	this.actval=r.actval;
}
 */
var js=JSON.stringify;
var jp=JSON.parse;




function upCR(arg,tab,o){
	// arg is arguments
	// tab is table name
	// o is object holding table, to write 
//	print("upCR start"+JSON.stringify(process.memory()));

	if(Object.keys(arg).length===0) return;	
	var del=0;
	if(arg["delete"] && arg["delete"]==="1") del=1, delete arg["delete"];
	//else console.log("didnt find delete");
	var tstr=o[tab];
	if(tstr.length==0) {o[tab]="['"+js(arg)+"']";}
	else {

		var tabarray=jp(tstr);
//		print("upCR2 else before loop",js(tabarray));
		var found=false;
		for(var i=0;i<tabarray.length;i++){
			var e=jp(tabarray[i]);
			if(e.name==arg["name"]) {
				found=true;
				if(del==1) tabarray.splice(i,1);
				else {for (var key in arg) {e[key]=arg[key];}
				tabarray[i]=js(e);}
				break;
			}
		}
		if(!found) tabarray.push(js(arg));

		o[tab]=js(tabarray);
	}
};

function uReq(nam,typ,v2,iod) {
	var f1="val";
	if(typ==="rule") f1="active";
	var rnode=iod.getList("name",nam,iod[typ+"s"], false);	
	if(Number(rnode[f1])!=Number(v2)) {
		rnode[f1]=v2;
		if(typ==="rule") upCR(rnode,typ+"s",iod);
		else setTimeout(function(){iod.request({event:"push",object:rnode});},5);
	//	print("uReq pushed request :"+js(rnode)); 
	}
}
function toms(hms){
	var a = hms.split(':'); // split it at the colons   
	for(var i=a.length;i<3;i++) hms="00:"+hms;
	a = hms.split(':'); // split it at the colons   
	return ((+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]))*1000;
};

function texec1(r,iod){
	print("---->"+Date().toString()," B part "+r.name);
	iod.timers[r.name].i1=-1;
	uReq(r.actvar2,r.acttype2,r.actval2,iod);
	//print("IOData.prototype.texec1 :",process.memory());
};

function tcyc(r,iod){
	print("---->"+Date().toString(),"A cycle"+r.name);
	var rt1=toms(r.t1);
	//print(" rt1 ",rt1,r.t1);
	//print("IOData.prototype.tcyc 1 :",process.memory());
	iod.timers[r.name].i1=setTimeout(texec1.bind(null,r,iod),rt1);
	//print("IOData.prototype.tcyc 2 :",process.memory());
	var tst=Date().getTime();
	iod.timers[r.name].ts=tst;
	
	upCR({name:r.name,ts:(parseFloat(tst)).toFixed(0)},"rules",iod);
//	print("ts",iod.timers[r.name].ts);

	uReq(r.actvar1,r.acttype1,r.actval1,iod);
//	print("IOData.prototype.tcyc 3 :",process.memory());
	/*		var rnode=iod.getList("name",r.actvar1,iod.nodes, false);	
	if(Number(rnode.val)!=Number(r.actval1)) {
		rnode.val=r.actval1;
		iod.request({event:"push",object:rnode});
		print("pushed request 1:"+js(rnode),r.actval2);
	}
	 */
};

function updateTimerRule(r,iod) {


//	print("updateTimerRule ",js(r));


	// start if activated but not started, stop if disactivated but not stopped
	// if started and wait or cycle/cycle value modified compared to saved values : adjust or restart; 
	// start if activated but not started
	// pb if cyc value change how to apply
	var rt=iod.timers[r.name];
	if(r.active=="1" ){
		if(rt===undefined) {// start timer, save timestamp and the 2 intervals.
			var li2=-1;
			if(r.cyc=="1") {
				var rt2=toms(r.t2); 		 
//				print("rt2 ",rt2,r.t2);
//				print("IOData.prototype.updateTimerRule 1:",process.memory());
				li2=setInterval(tcyc.bind(null,r,iod),rt2);					
//				print("IOData.prototype.updateTimerRule 2:",process.memory());
			}
			iod.timers[r.name]={i1:-1,i2:li2,ts:-1,t1:r.t1,t2:r.t2,cyc:r.cyc};
			print("started timer rule");
			//setTimeout(tcyc.bind(null,r,iod),5);
 			tcyc(r,iod);
		} else {// value change

			if(rt.t1==r.t1 && rt.t2==r.t2 && rt.cyc==r.cyc) { //no change				
			} else {// adjust
				if(rt.i2!=-1) clearInterval(rt.i2);
				if(rt.i1!=-1) clearTimeout(rt.i1);
				rt.t1=r.t1 ; rt.t2=r.t2 ; rt.cyc=r.cyc;
				var rt1=toms(r.t1);var rt2=toms(r.t2); 
				var ti=Date().getTime()-rt.ts;
				print("adjusting ",ti,rt1,rt2);
				if(ti<rt1) rt.i1=setTimeout(texec1.bind(null,r,iod),rt1-ti); else rt.i1=-1;
				if(ti<rt2 && r.cyc=="1") setTimeout(function(){rt.i2=setInterval(tcyc.bind(null,r,iod),rt2);tcyc();},rt2-ti);
			}
		}

	} else if(r.active=="0" && rt!==undefined) {
//		print("iod.timers[r.name].i2 ",rt.i2,rt.i1);
		if(rt.i2!=-1) clearInterval(rt.i2);
		if(rt.i1!=-1) clearTimeout(rt.i1);
		delete iod.timers[r.name];
		upCR({name:r.name,ts:"-1"},"rules",iod);
//		print("stopped timer rule");

	}

}


function IOData() { 
	this.nodes="";
	this.rules="";
	this.timers={};
	this.notify=function(ev){};
	this.ruleapp=0;
};


IOData.prototype.request=function(ev){print("request iod");if(ev.event=="push") this.updateNode(ev.object);}; 
//IOData.prototype.request=function(ev){print("request iod");if(ev.event=="push") this.updateNode(ev.object);}; 

IOData.prototype.getList=  function(fname,fval,ns,fulllist){
//	print("getList ns ",ns);

	var tab=[];
	var nodes=jp(ns);
//	print("getList after jp fval",fval);
	for(var i=0;i<nodes.length;i++){
//		print("node[i] ",nodes[i]);
		var n=jp(nodes[i]);
//		print("getList compare : ",n[fname],fval);
//		print("getList compare if : ",(n[fname]===fval));
		if(n[fname]===fval) {if(fulllist) tab.push(n); else return n;} 
	};
//	print("getList after loop fval",fval);
	if(tab.length>0) return tab;

};

IOData.prototype.ct=function(t){
	for (var p in this.timers){
		this.timers[p].ts=this.timers[p].ts+t;	
	}
};

IOData.prototype.applyRules =  function() {

	if(this.rules=="") return ; //nothing to apply
//	print("IOData.prototype.applyRules start");
	var rules=jp(this.rules);
	for(var i=0;i<rules.length;i++){
		var r=jp(rules[i]);
		if(r.active=="1" && r.ctype=="compare") {
			var result=false;
			var node=iod.getList("name",r.cvar,iod.nodes, false);	
			var nv=Number(node.val);	
			var cv=Number(r.cval);
			if(r.ccomp=="less" && nv<cv) {result=true;}
			if(r.ccomp=="greaterorequal" && nv>=cv) {result=true;}

			if(result){
				//	uReq(r.actvar,r.acttype,this);
				uReq(r.actvar,r.acttype,r.actval,iod);		
			}
		}
		else if(r.ctype=="timer") updateTimerRule(r,this);// if temporal rule updateRule
		else print("rule skipped ",js(r));


	};	
//	print("IOData.prototype.applyRules end");

};

IOData.prototype.rapp=function(i){
	while(i.ruleapp>0) {
		//print("ruleapp 3 ",this.ruleapp);
		i.applyRules();
		//	print("ruleapp 4 ",this.ruleapp);
		i.ruleapp--;
	};//print("IOData.prototype.updateNode loop end:",process.memory());		
} 

IOData.prototype.updateNode =  function(e) { // arg: {name:"Humidity", type:"input", unit:"\%", val:"-99"}
	print("IOData.prototype.updateNode",js(e));
//	  var u=process.memory().usage;
	upCR(e,"nodes",this);
//	print("update :",process.memory().usage-u," blocks");u=process.memory().usage;
	
//	print("notify func:",this.notify);
//	this.notify({event:"update",object:e});
	if(this.ruleapp==0) {
		this.ruleapp=1;
//		print("ruleapp 2 ",this.ruleapp);
		setTimeout(this.rapp,5,this);
	} else this.ruleapp++;
	//print("IOData.prototype.updateNode 4:",process.memory());

//	print("update timer:",process.memory().usage-u," blocks");u=process.memory().usage;

};

IOData.prototype.updateRule =  function(e) {
	print("IOData.prototype.updateRule: ",js(e));
	upCR(e,"rules",this);	
//	print("ruleapp 1",this.ruleapp);
	if(this.ruleapp==0) {
		this.ruleapp=1;
//		print("ruleapp 2 ",this.ruleapp);
		setTimeout(this.rapp,5,this);
	} else this.ruleapp++;

};

exports = IOData;


