
var js=JSON.stringify;
var jp=JSON.parse;

function IOPlug(iod){
	// can ask sensor and update value
	// can command relay to switch value

	this.timestamps={};
	this.iod=iod;
	this.min={pull:3,push:5};
	this.wait={};

	this.pull=function(o,f1){/*f1(o);*/ };// pull do nothing if not overridden // we do not update the value if no value is pulled

	//iod.notify=this.react;
//	console.log((this.respond.bind(this)).toString());
	iod.request=this.respond.bind(this);
	//print("request overriden");
	this.cleants=0;
};

IOPlug.prototype.push=function(o,f2){f2(o); };	

IOPlug.prototype.ct=function (t){
//	print("IOPlug.prototype.ct:",t,this.timestamps ); 	
	var ts=this.timestamps;
	if(!ts) return;

	for (var key in ts) {
		var nv=jp(ts[key]);
		nv.ts+=t;
		ts[key]=js(nv);
	};

	if(this.reqts) this.reqts+=t;
	if(this.toflash) {
		for (var k in this.toflash) {
			var e=jp(this.toflash[k]);
			e.ts+=t;
			this.toflash[k]=js(e);
		}}

	this.cleants=t;

	print("corrected timestamps:",js(ts)); 	 
};

IOPlug.prototype.pushed=function(o){
//	this.saveTimestamp({p1:"nodes",p2: "push"},{n:o.name, ts:(Date().getTime()).toFixed(),v:o.val});
	this.timestamps["nodes/push/"+o.name]=js({ts:Math.floor(Date().getTime()),v:o.val}); //save timestamp

	this.iod.updateNode(o);
	if(this.pushtosave) {this.savelog("push");this.pulltosave=0;}

};

IOPlug.prototype.pulled=function(o,end){
//	console.log("pulled:",o); 
	this.timestamps["nodes/pull/"+o.name]=js({ts:Math.floor(Date().getTime()),v:o.val}); //save timestamp

	// record every new value timestamp
	this.iod.updateNode(o);
	if(this.pulltosave && end) {this.savelog("pull");this.pulltosave=0;}
};


IOPlug.prototype.respond=function(ev){ // if too fast, 1 push is delayed using the last value, 1 pull all is used

	print("respond:",js(ev));
	var n;
	if(ev.object=="*") n=ev.object;
	else n=ev.object.name;
	var k=ev.event+"/"+n;
	var WR=this.wait[k];
	if(WR && WR.ts) { // blocked state
		if(WR.ts==ev.ts) {//unblock
			//	print("unblocking...");
			if(ev.event=="push") {ev.v=WR.v;/*ev.ts=WR.tss;*/}//use saved values instead}
			delete WR.ts;
		} else {
//			print("additional too many ",ev.event," skipping/saving...");
			if(ev.event=="push") {WR.v=ev.v;/*WR[k].tss=ev.ts;*/}	 // save new values
			return;
		}

	}		
	ev.ts=Math.floor(Date().getTime());
	var PT=this.timestamps,p="req/"+ev.event+"/"+n;
	var last=0;
	if(PT[p]) {
		last=jp(PT[p]);
		diff=ev.ts-last.ts;
		//	console.log("respond diff ",diff);
		var min=this.min[ev.event]*1000;
		if(diff<min) {
			print("too many ",ev.event," postponing...by",min-diff);
			var nv={ts:ev.ts}; // when it passes it raises the blocked state
			if(ev.event=="push") {nv.tss=ev.ts;nv.v=ev.v;}	// if its a push save also the value
			this.wait[k]=nv;
			setTimeout(this.respond.bind(this,ev),min-diff);//reschedule after the min and keep only one			
			return;

		}
	}
	/*	if(last){
		console.log("last ",last,ev.ts-last.ts);
	}
//	console.log("evts ",ev.ts);		
	 */
	PT[p]=js({ts:ev.ts}); //save timestamp
//	console.log("PT ",p, PT);		

//	console.log("current ev.event",ev.event);


	if(ev.event=="push" || ev.event=="pull") {		
		return this[ev.event](ev.object,this[ev.event+"ed"].bind(this));
	}

	// keep last timestamp per event per object name

};


exports = IOPlug;


/*
IOLog.prototype.react=function(e){
	print("react:",e,", object",js(e.object));
};
 */


IOPlug.prototype.logger=function(a){
	var timeo={logtime:60,mintime:3,stattimes:5};
	if(a=="start") {
		this.toflash={};
		//	this.toflash=0;


		this.pushtosave=true;
		this.avg={};

		this.loginter =setInterval((this.logger).bind(this),timeo.logtime*1000);

		this.logger();


	}
	if(a=="stop") clearInterval(this.loginter);

	if(!a) {
//		var u=process.memory().usage;
//		console.log("timer :",(Date().getTime()));
		//	console.log("getTimestamp:",this.getTimestamp("nodes", "pull")); 
		this.pulltosave=1;
		this.reqts=Math.floor(Date().getTime());
//		print("after inits:",process.memory().usage-u);
		var u=process.memory().usage;

		// pull only if there is no available ok value
//		var pulls=this.plug.getTimestamp("nodes", "pull");

		var PT=this.timestamps, base="nodes/pull";
		var s=[];
		for(var k in PT) if(k.indexOf(base)==0) s.push(k);		
		//var pulls=this.plug.getTimestamp("nodes", "pull");]
		//	console.log("timestamps",s);	
		var topull=1;
		for(var i=0;i<s.length;i++) {
			var ev=jp(PT[s[i]]);

			topull=0;
			var diff=(this.reqts-ev.ts)/1000;
			//	print("topull diff",diff);
			if(diff>timeo.mintime) topull=1;
		}
//		print("topull",topull);

		if(topull) {print("######logger pulling");this.respond({event:"pull",object:"*"});}// request a refresh	// should wait and save the reply	
		else {print("######logger found good pull");this.pulltosave=0;this.savelog();}

		print("after respond:",process.memory().usage-u);u=process.memory().usage;   
		//	print(JSON.stringify(E.getSizeOf(this,1)));

	}

};









pileToFlash=function(it,plug){
	var pg=plug.pile;
	if(it){
		pg=plug.pile= pg || [];
		pg.push(it);
		//	print("pileToFlash this.pile",pg);
		if(pg.length==1 && !plug.unpiling) setTimeout(pileToFlash,50,null,plug);
		plug.unpiling=true;

	} else {
		var it=pg.shift();
//		print("unpiled ",it);
//		plug.log.saveToFlash(it);
//		print("plug saving to flash");
		r("IOLog")({it:it,mm:plug.log});
		if(pg.length>0) setTimeout(pileToFlash,50,null,plug);
		else plug.unpiling=false;
	}

};

IOPlug.prototype.savelog=function(fi){
	var timeo={logtime:60,mintime:3,stattimes:5};
	var PT=this.timestamps, base="nodes/"+fi;//, fMap=r("FlatMap").flatMap;
	var s=[];
	for(var k in PT) if(k.indexOf(base)==0) s.push(k);		
	//var pulls=this.plug.getTimestamp("nodes", "pull");]
	console.log("timestamps",base,s);	

	for(var i=0;i<s.length;i++) {
		var ev=jp(PT[s[i]]);
		var k=s[i].substring(base.length+1,s[i].length);
		//	console.log("ev",ev);
		if(ev.v==-1) {print("Sensor not working",k);continue;}
		var diff=(ev.ts-this.reqts)/1000;
		var m=0;
		if(k.indexOf("Humid")!=-1) {m=1;}
		//var flk=fMap({n:k,fm:this.toflash});	//this.toflash[k];
		var flk=this.toflash[k];
		if(flk) flk=jp(flk);
		print("flk",flk);
		if(k.indexOf("Relay")!=-1) {
			if(!flk) {if(ev.v==1) m=3; else m=2;}
			else m=flk.m;
		}

		//	if(this.toflash[k]) print("toflash[k]",this.toflash[k]);

		if(flk && flk.unsync && this.cleants && flk.p) {
			print("saving resync tag to flash");
			var sav={k:k,diff:this.cleants,m:4};	
			pileToFlash(sav,this);
			if(ev.v==1) m=3; else m=2;
		}
		//	var mm=m;
		//	if(!this.cleants) mm=m | 128;

//		console.log("logger diff",diff,m);
		if(m==2 || m==3 || diff<timeo.mintime) {
//			console.log("logger2 diff",diff,m);
			// save log value direct to flash
			var val=Math.floor(ev.v*10);
			var sav=flk;
			var inter=timeo.logtime;
			if(sav) {inter=((ev.ts-sav.ts)/1000);sav.inter=inter;}	//previous time
			if (!m && sav && sav.v==val) sav.rep++;
			else { 
				//			print("sav",sav,m,val);

				var p=0;
				if(!m && sav) {pileToFlash(sav,this);p=1;}

				sav={k:k, v:val,ts:ev.ts,m:m,inter:inter,unsync:!this.cleants,p:p};				
				//			print("new sav",k,sav);
				if(!m) sav.rep=0;
				if(m>0) {pileToFlash(sav,this);sav.p=1;}
				//	this.toflash[k]=sav;
				//	this.toflash=fMap({n:k,v:sav,fm:this.toflash});
				this.toflash[k]=js(sav);
			}
			if(m<2) {
				// save stats
				var tms=timeo.stattimes ;
				if(!this.avg[k]) {this.avg[k]={v:0,times:tms};/*print("new avg",this.avg[k]);*/}
				var av=this.avg[k];

				av.v+=val/tms;	// calculate average

				//		print("av",av);
				print("average sum calculated",av.v,tms*av.v/(tms-av.times+1));
				//		print("statc",k,av.times);
				if(av.times) av.times--; 

				if(av.times===0){
					av.times=tms;
					sav={k:k+"-Stat", v:av.v, ts:ev.ts, m:1, inter:timeo.logtime*tms};
					pileToFlash(sav,this);

					av.v=0;}				
			}
		}
//		console.log("logger3 diff",diff,m);
	}

//	var p=this.plug.timestamps["nodes/pull"];
//	console.log("p",p);

};








