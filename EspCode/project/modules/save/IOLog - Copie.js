
var js=JSON.stringify;
var jp=JSON.parse;

function IOLog(iod){
	// can ask sensor and update value
	// can command relay to switch value

	this.timestamps={};
	this.iod=iod;

	this.pull=function(o,f1){/*f1(o);*/ };// pull do nothing if not overridden // we do not update the value if no value is pulled
	
	//iod.notify=this.react;
//	console.log((this.respond.bind(this)).toString());
	iod.request=this.respond.bind(this);
	//print("request overriden");

}

IOLog.prototype.push=function(o,f2){f2(o); };	

IOLog.prototype.correctTimestamps=function (t){
	/*if(this.timeStamps===undefined) return;
	else ts=jp(this.timeStamps);	

	for (var key in ts) {
		for (var key2 in ts[key]) {
			ts[key][key2]= (parseFloat(ts[key][key2])+t).toFixed();
//			print("corrected date to :"+Date(parseFloat(ts[key][key2])).toString());
		}
		this.timeStamps=js(ts);
		print("corrected timestamps:",js(ts)); 
	};
	 */
};

IOLog.prototype.pushed=function(o){
	this.saveTimestamp("nodes", "push",o.name, (Date().getTime()).toFixed(),o.val);

	this.iod.updateNode(o);
};

IOLog.prototype.pulled=function(o,end){
	this.saveTimestamp("nodes","pull", o.name, (Date().getTime()).toFixed(),o.val);
	if(this.pulltosave && end && 0) {this.savelog();this.pulltosave=false;}
	// record every new value timestamp
	this.iod.updateNode(o);
};
/*
IOLog.prototype.logtimed=function(a){
		// check if there is a fresh value
		// if not request and wait for a fresh value
	console.log("getTimestamp:",this.getTimestamp("pulls", o.name)); 
};
 */

IOLog.prototype.savelog=function(){
	var pulls=this.getTimestamp("nodes", "pull");
	//var t=(Date().getTime()).toFixed();
	//console.log("pulls",pulls);
	for(var k in pulls ){
	//	console.log(k,pulls[k]);	
		var diff=(pulls[k].ts-this.reqts)/1000;
	//	console.log("diff:",diff," sec");
		if(diff<this.mintime) {
			//log value
			if(!this.tstab[k]) {
				this.tstab[k]= new Int16Array(this.maxdata);this.log[k]=0;
				this.valtab[k]= new Int16Array(this.maxdata); 
			}			
			// if same value than last skip it
			var ki=this.log[k],kp=ki-1,v=(pulls[k].val*10).toFixed();	
			if(kp<0) kp+=50;
			this.tstab[k][ki]=(pulls[k].ts-this.refts)/1000;
			this.valtab[k][ki]=v;
	//		console.log("added value to log",this.tstab[k][ki],this.valtab[k][ki]);
	//		console.log("log");
			print("log:",k,"ts",this.tstab[k]);
			print("log:",k,"val",this.valtab[k]);
			console.log("ind",this.log);
			if(this.valtab[k][ki]!=this.valtab[k][kp]){
				if(ki<this.maxdata) this.log[k]++;
				else{this.oldref=this.refts;this.refts=(Date().getTime()).toFixed();this.log[k]=0; } // put the index back at the beginning, save old ref											
			} //else {console.log("skipped same value of ",k);if(!this.rep[k]) this.rep[k]=1; else this.rep[k]++;/*console.log("this.rep",k,this.rep[k]);*/}
			
			
			// stat on log
			if(!this.statmem[k]) {var u=process.memory().usage;  //  414 - 32
				this.statmem[k]=new Int16Array(this.statmemsize);
				this.statindexes[k]=new Int16Array(this.statim);
				print(k," stat table created of :",process.memory().usage-u);u=process.memory().usage;  
			}
			this.statmem[k][this.statindexes[k][0]]=v; 
			var is=this.statindexes[k],sb=this.statbase, bi=0;
			for(var l=0;l<sb.length;l++){
				if((is[l]+1)==sb[l]) {// cycle
					if((l+1)<sb.length) {
						var m=0;
						for(var j=0;j<sb[l];j++) {m+=this.statmem[k][bi+j];}
						var av=m/sb[l];
						print("Calculated average on :",av,l);
						this.statmem[k][bi+sb[l]+is[l+1]]=av;						
					}  
					is[l]=0;
				} else {is[l]++;break;} 
				bi+=sb[l];
			}
			print("statindex",k,this.statindexes[k]);
			print("stat:",k,this.statmem[k]);	
		}
	}
	
	
	
			


};



IOLog.prototype.logger=function(a){
	if(a=="start") {
		// log to
		
		
	//	var u=process.memory().usage;  //  
		this.logtime=60;
		this.mintime=10;
		this.maxdata=120;
		this.refts=0;
		this.tstab= {};this.valtab= {};this.log= {};
		this.refts=(Date().getTime()).toFixed();	// 7 for caching date + 5 for var and data=12
	//	print("timer vars created:",process.memory().usage-u);u=process.memory().usage;   // 12 + 19
	//	print(JSON.stringify(E.getSizeOf(this,1)));
		
		
		this.statbase=new Int16Array([60,24,7,4]);	// caches Int16Array
		this.statim=Int16Array([0,0,0,0]);
		this.statindexes={};
		this.statts=this.refts;
		this.statmemsize=0;
		for(var i=0;i<this.statbase.length;i++) this.statmemsize+=this.statbase[i];
		this.statmem={};
//		print("stat vars created:",process.memory().usage-u);u=process.memory().usage;   
//		print(JSON.stringify(E.getSizeOf(this,1)));

		
		this.loginter =setInterval((this.logger).bind(this),this.logtime*1000);
//		print("interval created:",process.memory().usage-u);u=process.memory().usage;   
		this.logger();
//		print("logger called:",process.memory().usage-u);u=process.memory().usage;

	}
	if(a=="stop") clearInterval(this.loginter);

	if(!a) {
		var u=process.memory().usage;
//		console.log("timer :",(Date().getTime()));
		//	console.log("getTimestamp:",this.getTimestamp("nodes", "pull")); 
		this.pulltosave=true;
		this.reqts=(Date().getTime()).toFixed();
//		print("after inits:",process.memory().usage-u);
		var u=process.memory().usage;
		this.respond({event:"pull",object:"*"});// request a refresh	// should wait and save the reply	
		print("after respond:",process.memory().usage-u);u=process.memory().usage;   
	//	print(JSON.stringify(E.getSizeOf(this,1)));

	}

};

IOLog.prototype.getTimestamp=function(field,i){
//	console.log("a", field);
	var a=this.timestamps[field];
//	console.log("a", a);
	if(a) {
		a=jp(a);
//		console.log("a2", a,i,a[i]);
		return a[i];
	} else return null;
};

IOLog.prototype.saveTimestamp=function(field,i,j,v,v2){	
	var ts;
	if(!this.timestamps[field]) ts={};
	else ts=jp(this.timestamps[field]);	
	if(!ts[i]) ts[i]={};
	if(!ts[i][j])ts[i][j]={};
	ts[i][j].ts=v;
	if(v2) ts[i][j].val=v2;
	this.timestamps[field]=js(ts);
//	print("updated timestamps:",field, this.timestamps[field]); 
};

IOLog.prototype.respond=function(ev){
//	print("respond:",js(ev));
	if(ev.object!=="*") {
		var now=Date().getTime();
		this.saveTimestamp("req",ev.event, ev.object.name, (now).toFixed());
		//      print("current timestamp:",now);
	}	
	if(ev.event=="push") {		
		return this.push(ev.object,this.pushed.bind(this));

	}
	if(ev.event=="pull") {
		return this.pull(ev.object,this.pulled.bind(this));
		 
	}
	
	// keep last timestamp per event per object name

};
/*
IOLog.prototype.react=function(e){
	print("react:",e,", object",js(e.object));
};
 */


exports = IOLog;

/*
function hoffEnc(text){
	// build tree for each char
	// build index

	var ind={};
	for(var j=0;j<text.length;j++) {
		var c=text[j];
		if(ind[c]) continue;
		ind[c]={};
		var p = text.indexOf( c ),n=0;
		while(p!=-1) p = text.indexOf( c,p + 1 ),n++;
		if(c=="_") c="__";//escape _ char
		ind[c].occ=n;
	}
  console.log("ind",ind);
	// make tree	
	// find 2 smallest
	var nn=0,s=1,last;
	while(s){
		var mc=-1,m=-1;s=0;
		for(var k in ind) {if(!ind[k].m && (!s || ind[k].occ<m)) {m=ind[k].occ;mc=k;s=1;}} // find min		
		if(s)ind[mc].m=true,last=mc;
		var mc2=mc;s=0;
		for(var k in ind) {
    if(!ind[k].m && (!s || ind[k].occ<m.occ)) {m=ind[k];mc=k;s=1;}} // find min
		if(s)ind[mc].m=true,last=mc;
		// make a new node
    if(s){
		var newnam="_"+nn;nn++;ind[newnam]={occ:ind[mc].occ+ind[mc2].occ};
		ind[newnam].d0=mc;ind[newnam].d1=mc2;
		ind[mc].up=newnam;ind[mc2].up=newnam;
//    console.log("mc",mc," mc2",mc2);
 //     console.log("last",last,s);
      }
	}
	// add the bit equivalent


	function fillCode(t,k,s){//console.log("fillCode",k,t[k].d0);
  	if(t[k].d0) {
				if(t[k].d0) fillCode(t,t[k].d0,s+"0");
				if(t[k].d1) fillCode(t,t[k].d1,s+"1");			
		} else t[k].c=s;
  // console.log("fillCode",s);
	// console.log("fillCode",k,t[k].c);}
	};	
  console.log("last",last);
//	ind[last].c="";//root
	fillCode(ind,last,"");

	//transcribe the message
	var mess="";
	for(var j=0;j<text.length;j++) {
		var c=text[j];
		mess+=ind[c].c;
  //  console.log("c",c,ind[c]);
		}
  console.log("mess",mess);

	// concat dictionnay+message
	var dict={d:""};
	function writeTree(t,k,d){
 // console.log("writeTree",k,d);
		if(t[k].c){
			d.d+="1";
      if(k==",") k=10;
      //if(k==",") k=11;

			var b=(k>>>0).toString(2);
      //console.log("writeTree ",k,b);
			while(b.length<4) b="0"+b;
			d.d+=b;console.log("writeTree ",k,b);
		} else {
			d.d+="1";
			writeTree(t,t[k].d0,d);
			writeTree(t,t[k].d1,d);
		}
	}
	writeTree(ind,last,dict);
  console.log("dict",dict.d);
//  console.log("ind",ind);

  console.log("size",mess.length,dict.d.length);

}

function hoffEncbin(text){
	// build tree for each char
	// build index

	var ind={};
	for(var j=0;j<text.length;j++) {
		var c=text[j];
		if(ind[c]) continue;
		ind[c]={};var n=0;
		for(var i=0;i<text.length;i++) if(c==text[i]) n++;
		ind[c].occ=n;
	}
  console.log("ind",ind);
	// make tree	
	// find 2 smallest
	var nn=0,s=1,last;
	while(s){
		var mc=-1,m=-1;s=0;
		for(var k in ind) {if(!ind[k].m && (!s || ind[k].occ<m)) {m=ind[k].occ;mc=k;s=1;}} // find min		
		if(s)ind[mc].m=true,last=mc;
		var mc2=mc;s=0;
		for(var k in ind) {
    if(!ind[k].m && (!s || ind[k].occ<m.occ)) {m=ind[k];mc=k;s=1;}} // find min
		if(s)ind[mc].m=true,last=mc;
		// make a new node
    if(s){
		var newnam="_"+nn;nn++;ind[newnam]={occ:ind[mc].occ+ind[mc2].occ};
		ind[newnam].d0=mc;ind[newnam].d1=mc2;
		ind[mc].up=newnam;ind[mc2].up=newnam;
//    console.log("mc",mc," mc2",mc2);
 //     console.log("last",last,s);
      }
	}
	// add the bit equivalent


	function fillCode(t,k,s){//console.log("fillCode",k,t[k].d0);
  	if(t[k].d0) {
				if(t[k].d0) fillCode(t,t[k].d0,s+"0");
				if(t[k].d1) fillCode(t,t[k].d1,s+"1");			
		} else t[k].c=s;
  // console.log("fillCode",s);
	// console.log("fillCode",k,t[k].c);}
	};	
  console.log("last",last);
//	ind[last].c="";//root
	fillCode(ind,last,"");

	//transcribe the message
	var mess="";
	for(var j=0;j<text.length;j++) {
		var c=text[j];
		mess+=ind[c].c;
  //  console.log("c",c,ind[c]);
		}
  console.log("mess",mess);

	// concat dictionnay+message
	var dict={d:""};
	function writeTree(t,k,d){
 // console.log("writeTree",k,d);
		if(t[k].c){
			d.d+="1";

      //if(k==",") k=11;

			var b=(k>>>0).toString(2);
      //console.log("writeTree ",k,b);
			while(b.length<16) b="0"+b;
			d.d+=b;console.log("writeTree ",k,b);
		} else {
			d.d+="1";
			writeTree(t,t[k].d0,d);
			writeTree(t,t[k].d1,d);
		}
	}
	writeTree(ind,last,dict);
  console.log("dict",dict.d);
//  console.log("ind",ind);

  console.log("size",mess.length,dict.d.length);

}*/
