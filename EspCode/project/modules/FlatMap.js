
//must be able to store data as string and retreive it 
//with index, write cache diff

//e.g.: flatMap({ft:{}, n:"humidity",v:{m:2,..}}); // update or store if not found
//flatMap({ft:ft, n:"humidity"});	// find
//flatMap({ft:ft, n:"humidity",c:"delete"});	//remove

//flatMap({ft:ft, c:"first"}); //get first item
//flatMap({ft:ft, n:"humidity",c:"next"}); //get next item


/*
exports.SimiliFlash =function(addr,ps) {
	this.addr=addr;
	this.pagesize= ps | 200;
	this.data=new Uint8Array(200);
	for(var i=0;i<this.data.length;i++) this.data[i]=0xFF;
	this.read=function(l,addr){
		var off=addr-this.addr;
		return new Uint8Array(this.data.slice(off,off+l));
	};
	this.write=function(data,addr){	//check for multiple of 4 start and size
		var off=addr-this.addr;
		//	if(off%4) print ("NOT MULTIPLE OF 4 OFFSET !",off);
		//	print("before written to data",off, this.data);
		this.data.set(data,off);
		//	print("after written to data",off, this.data);
	};
	this.toString=function(){
		var s="",l=this.data.length;
		for(var ij=0;ij<l;ij+=64) {
			var e=ij+64;
			if(e>l) e=l;
//			var k=sc.apply(0,m.slice(ij,e));
			var k=E.toString(this.data.slice(ij,e));
			s+=k;
			//		print("SimiliFlash.toString k",k);
			//		print("SimiliFlash.toString s",s);
		}
		return s;
	};
	this.getPage=function() {return {length:this.pagesize}};
};
*/


/*	arg :{
			ff:{
			-provided
			fm:map,a0:address,s:sizeinpages, nomem:1useonlyflash
			-stored
			ac:currentoffset, ae:endofstreamoffset,curp:currentstartpage}
			}
 */






flatMap=function(arg){	
	var ff=arg.ff, FL=0;if(ff) FL=ff.sf;
	var js=JSON.stringify;
	var jp=JSON.parse;
	var sc=String.fromCharCode;/*
	////////////////// ffMap functions
	// read from flash
	if(arg.read) {		
	var off=arg.s, l=arg.l, adr=ff.ac+off;
	if(adr>ff.af) off-=ff.af;
	if(off+l<ff.af) return FL.read(l,ff.a0+adr);
	else {		// if cycle in middle, read in two parts
		var adre=off+l-ff.af;
		var a=FL.read(ff.af-adr,ff.a0+adr);
		var b=FL.read(adre,ff.a0);
		var c=new Uint8Array(l);
		c.set(a);c.set(b,a.length);
		return c;
	} 	
	}
	/////////////////// ffMap functions
	// write to flash
	if(arg.writ) { // arg : s:position rel to ae, v:value tab/string		// ret : 
		var ds=0, v=arg.v;

		for(var i=0;i<v.length;i++) {
			if(typeof(v[i])=="string") ds+=v[i].length; else ds++;
		}
		//	print("ds",ds);
		// calculate prefix
		var pre=(arg.s)%4;
		var post=pre+ds;
		if((post % 4)) post+=4-(post % 4);	
		var d=new Uint8Array(post);
		var s=0;
		while(s<pre) {d[s]=0xFF;s++;}
		//	print("pred",d);
		for(var i=0;i<v.length;i++) {
			if(typeof(v[i])=="string") {d.set(v[i],s);s+=v[i].length; }
			else {d[s]=v[i];s++;}
		}
		while(s<post) {d[s]=0xFF;s++;}
		var init=arg.s-pre;
		//	print("init",init,"ae",ff.ae,"s",arg.s,"ac",ff.ac,"pre",pre);

		flatMap({tost:1,reve:d,s:init,e:init+post,ff:ff});
		/*
		var fp=ff.ae+arg.s-pre;
		if(ff.curp>2 && fp>ff.af) off-=ff.af;
		var fp0=fp;
		var fe=fp+post,fe0=fe;
		if(ff.curp>2 && fe>ff.af) {fe=ff.af;fe0-=ff.af;}		
//		print("d",d);
		var i=0;
		while(fp<fe) {
			var e=fp+64;
			if(e>fe) e=fe;
			FL.write(d.slice(i,i+e-fp),ff.a0+fp);	
	//		print("written",d.slice(i,i+e-fp));
	//		print("fp",fp,"fe",fe);
			i+=e-fp;	
			if(e<fe) fp+=64; 
			else if(fe!=fe0) {fp=0;fe=fe0;}//cycle
			else break;
		}* /
		//	print("FL",FL);
		return;

	}

	///////////////// ffMap functions
	// tostring from flash
	if(arg.tost) {
 
		var s="";
		var d=arg.e-arg.s;
		var ij=ff.ac+arg.s;
		if(ff.curp>2 && ij>ff.fa) ij-=ff.fa;
		var fe=ij+d,fe0=fe;
		if(ff.curp>2 && fe>ff.fa) fe-=ff.fa;
		var i=0;
//		print("ij",ij,"fe",fe);

		while(ij<fe) {
			var e=ij+64;
			if(e>fe) e=fe;			
			var k;

			if(arg.reve) {
				FL.write(arg.reve.slice(i,i+e-ij),ff.a0+ij);
				i+=e-ij;
			}
			else {
				k=E.toString(FL.read(e-ij,ff.a0+ij));
				//			print("tost k",k,ij,e,fe);
				s+=k;
			}
			//	return;
			if(e<fe) ij+=64; 
			else if(fe!=fe0) {ij=0;fe=fe0;}//cycle
			else break;
		}
		return s;
	}
	////////////////////////////////////// ffMap functions
	// read item from flash		 
	if(arg.rite) {		
		var off=arg.s;
		var x2=flatMap({read:1,s:off,l:3,ff:ff});
		//FL.read(3, ff.ac+off);			
		var kl=x2[0];
		var vl=x2[1]*0x100+x2[2];
		off+=3;
		var e=off+kl;
		var k=flatMap({tost:1,s:off,e:e,ff:ff});			 
		// for each element
		var v;
		if((arg.n && k==arg.n) || !arg.n) {	
			v=flatMap({tost:1,s:e,e:e+vl,ff:ff});
		}			
		return {n:k, v:v,vl:vl};
	} 


*/












	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////


	var m=arg.fm;

	// Function tos : item to string from s to e
	if(arg.tos) {
		var s="";
		for(var ij=arg.s;ij<arg.e;ij+=64) {
			var e=ij+64;
			if(e>arg.e) e=arg.e;
			var k=E.toString(m.slice(ij,e));
			s+=k;
		}
		return s;
	}

	if(arg.shif){
//		print("arg",js(arg));	
		var e=arg.e,d=arg.d;
		if(arg.d<0)	{
			for(var i=arg.s;i<(e+d);i+=64) {
				var f=i+64;if(f>e) f=e;
				//		print("slice from",i+d,f+d,"placed at",i+d);
				m.set(m.slice(i,f),i+d);}
		} else {
			if((e+d)>m.length) m=arg.fm=flatMap({fm:m, real:1,size:e+d});
			for(var i=(e+d);i>arg.s;i-=64) {
				var f=i-64;if(f<arg.s) f=arg.s;
				m.set(m.slice(f-d,i-d),f);
			}
		}
		return m;
	}

	// Function real :reallocate if size>m.length
	var csiz=64;
	if(arg.real) {		
		if(arg.size>m.length) {
//			print("reallocating",m.length,arg.size);
			var min=Math.floor(arg.size/csiz)+1;				
			var fm2=new Uint8Array(min*csiz);
			fm2.set(arg.fm,0);
			delete arg.fm;	//probably useless
			arg.fm=fm2; 
			return fm2;
		} else return arg.fm;
	}

	// Function set : set a key and value at s position
	var off=2;
	if(arg.set) {
		var s=arg.s,vl=arg.v.length;
		m[s++]=arg.n.length; //keysize 1byte		
		m[s++]=vl/0x100;
		m[s++]=vl; //keysize 2bytes		
		m.set(arg.n,s);s+=arg.n.length; //key
		m.set(arg.v,s);s+=arg.v.length; //value		 
//		print("written",arg.n,arg.v);
//		print("written",sc(m[s-arg.v.length]));
		arg.s=s;
		return s;
	}

	// Function srch  : search a key before offset arg.e, from optional offset arg.s
	if(arg.srch) {
		var e=arg.e;// find key
		if(!e) e=m[0]*0x100+m[1]; 
		if(arg.off) off=arg.s;
		print("flatMap search for",arg.n,off,e);
		//	print("m",m);
		while(off<e ) { 
			var kl=m[off++];
			var vl=m[off]*0x100+m[off+1];off+=2;
			var k=flatMap({fm:m, tos:1,s:off,e:off+kl});			 
			// for each element			
			if(k==arg.n) {
				var v=flatMap({fm:m, tos:1,s:off+kl,e:off+kl+vl}); 
				//			print("flatMap kb ",k,off,v);
				return {n:k,v:v,s:off-3};
			}
			off+=kl+vl;
			//		print("flatMap k",k,off);
		}
		return ;
	}


	var prof=getTime();

	// Function iterate  
	var e;
	if(arg.first || arg.next) {
		e=m[0]*0x100+m[1]; 
		if(arg.next) {if(arg.s<e) off=arg.s; else return null;}
		var kl=m[off++];
		var vl=m[off]*0x100+m[off+1];off+=2;
		var k=flatMap({fm:m, tos:1,s:off,e:off+kl});	 	
		var v=flatMap({fm:m, tos:1,s:off+kl,e:off+kl+vl});
		return {n:k,v:v,ni:off+kl+vl};			
	}


	// Function add, update, get  : set a key and value at arg.s position

//	print("arg",js(arg));	

	if(!m){
		var v=js(arg.v);
		var min=Math.floor((v.length+arg.n.length+3+2)/csiz)+1;				
		m=new Uint8Array(min*csiz);
//		print("create first",arg.fm);
		e=2; 
	}
	if(m){		
		//find if element exists
		if(arg.fm) e=m[0]*0x100+m[1];
//		print("m",m.length,e);
		var v;
		off=e;
		if(arg.fm) {
			var item=flatMap({fm:m, srch:1,n:arg.n,e:e});
			if(item){
				v=item.v;
				if(arg.del) {
					print("flatMap deleting");
					var l=item.v.length+item.n.length+3;
					arg.s=item.s;arg.d=-l;
					v=flatMap({ shif:1,d:-l,fm:m,s:item.s+l,e:e});
					m[0]=(e-l)/0x100;m[1]=e-l;//update length
					return m;					 
				}
				if(!arg.v) return jp(v);				//return found item
				else {
					// update
					// size could be bigger
					var o=jp(v),o2=arg.v;
					for(var key in o2) {o[key]=o2[key];}		// update values
					var it=js(o);
					var itl=it.length;
					var d=v.length-itl;
					var sz=arg.n.length+itl+3;
					if(d<0)
						if (d!=0) m=flatMap({ shif:1,d:-d,fm:m,s:item.s+sz,e:e});
					if(d!=0){m[0]=(e-d)/0x100;m[1]=e-d;}
					off=item.s;v=it;// update offset to write at the right place					
				}
			} 
		} 
		if (arg.v){			
			//		print("e",e,off);			 
			if(e==off) {	// item not found
				v=js(arg.v);
				print("v",v.length,v,arg.n);			 
				if(m) m=arg.fm=flatMap({fm:m, real:1,size:e+v.length});// if item not found reallocate if needed
			}
			print("writing",e,off);
			var off2=flatMap({fm:m, set:1,s:off,n:arg.n,v:v});
			if(e==off) {m[0]=off2/0x100;m[1]=off2;}  
			arg.s=off;

			var s=flatMap({fm:m, tos:1,s:2,e:off2});
			print("as string:",s);			
		} else return null;
	}
//	print("call took ",getTime()-prof,"ms");

	return arg.fm;	
};

exports.flatMap=flatMap;
/*
start=function(){
	var pf=getTime();
	var a={n:"humidity",v:{m:2,st:1,name:"humid"}};
	//print("T - step0 took ",getTime()-pf,"ms");pf=getTime();
	var m=flatMap(a);
	//print("T - step0.5 took ",getTime()-pf,"ms");pf=getTime();
	m=flatMap({fm:m, n:"temperature",v:{m:4,st:9,name:"hot"}});
	//print("T - step1 took ",getTime()-pf,"ms");pf=getTime();
	var o=flatMap({fm:m, n:"humidity"});
	print("o",o);
	//print("T - step2 took ",getTime()-pf,"ms");pf=getTime();
	flatMap({fm:m, n:"temperature",v:{name:"hotter"}});
	//print("T - step3 took ",getTime()-pf,"ms");pf=getTime();
	o=flatMap({fm:m, n:"temperature"});
	print("o",o);
	o=flatMap({fm:m, n:"temperature",del:1});
	//print("T - step4 took ",getTime()-pf,"ms");pf=getTime();
	o=flatMap({fm:m, n:"temperature"});
	//print("T - step5 took ",getTime()-pf,"ms");pf=getTime();
	print("o",o);
	print("T - step6 took ",getTime()-pf,"ms");

	//iterate

	var n=flatMap({fm:m,first:1});
	while(n) {
		print("iterate ",n);// supposed n.n key, n.v value, n.i index, n.ni nextindex
		n=flatMap({fm:m,next:1,s:n.ni});
	}


};



setTimeout(start,2000);

 */
