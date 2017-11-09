
//must be able to store data as string and retreive it 
//with index, write cache diff

//e.g.: flatMap({ft:{}, n:"humidity",v:{m:2,..}}); // update or store if not found
//flatMap({ft:ft, n:"humidity"});	// find
//flatMap({ft:ft, n:"humidity",c:"delete"});	//remove

//flatMap({ft:ft, c:"first"}); //get first item
//flatMap({ft:ft, n:"humidity",c:"next"}); //get next item
var js=JSON.stringify;
var jp=JSON.parse;
var sc=String.fromCharCode;


/*	arg :{
			ff:{
			-provided
			fm:map,a0:address,s:sizeinpages, nomem:1useonlyflash
			-stored
			ac:currentoffset, ae:endofstreamoffset,curp:currentstartpage
			ac0, af, fe}
			}
 */


ffMap=function(arg){

 
	///////////////////////////////////////////////////////////////////////////////////////
	//							LOW LEVEL flash file								  	 //
	///////////////////////////////////////////////////////////////////////////////////////
	
	//	includes repo: reposition to last stream, 
	// (in FlatMap) : read/writ : with cycling, rcel: read a cell of 2 parts with 1+2 bytes of size in the beginning
	

	
	//////////////////////////////////////
	// repo : reposition at the end of the stream setup all variables :
	// curp:current start page, ac0:start page address, af:all flash available, ac:current stream, ae:current end of stream, fe:bytes left in the stream from ae)
	/*
	if(arg.fiXX) {	 // find next arg.xl*XX 
//		print("fiXX arg",arg, arg.e);
		var xl=arg.xl;
		for (var j=arg.s;j<arg.e;j+=arg.d) {// for each page check if blank, use first after blank (at least one will be swap and blank)
	 		var x=ffMap({read:1,s:j,l:xl,ff:arg.ff});
	 		print("arg.fiXX ",x,xl);
	 		var i=0;
	 		while(i<xl) {
	 			print("arg.fiXX2 ",i);i++;
	 		}
/*	 		for(;i<xl;i++) {
	 			print("arg.fiXX2 ",i);
	 			print("arg.fiXX2.1 ",x[i],(x[i]!=0xFF));
	 			if(x[i]!=0xFF) {
	 				print("arg.fiXX2.5 ",i);
	 				break;}
	 			print("arg.fiXX2.2 ",x[i],i);
	 			}	
	* / 		print("arg.fiXX3 ",x,xl);
	 		if(i==xl) {	 		
	 			print("arg.fiXX4 ",x,xl);
	 			return j;}; 
 		}
	}*/
	
//	var pf=getTime();var a=0;var ar=Uint8Array(200);ar.forEach(function(){a=a+1;});print("forEach",getTime()-pf);a=0;pf=getTime();var l=ar.length;for(var i=0;i<l;i++) {a=a+1;};	print("for",getTime()-pf);
	
	if(arg.repo) {	 //// first time reposition 	//>use when jsvar fails forEach()
		var ff=arg.ff, FL=ff.sf;				
		var ps=FL.getPage(ff.a0).length;
		
		var curp=0;
		for (var i=0;i<ff.s;i++) {// for each page check if blank, use first after blank (at least one will be swap and blank)
			var x=FL.read(8, ad+i*ps),i=0;
			for(;i<8;i++) if(x[i]!=0xFF) break;
			if(i==8) {
				curp=i+1;
				if(curp>ff.s) curp=0;
			} 
		} 
		//	print("T - ffMap reposition A ",1000*(getTime()-pf),"ms");
		ff.curp=curp;
		ff.fe=ff.lp*ps;		//bytes left in flash from ac
		ff.af=ff.lp*ps;	//cycling/end limit address
		//	ff.ac0=curp*ps;		// from here offsets start, address of current start page
		ff.ac0=ff.ac=curp*ps;		// from here offsets start, adress of current stream
		var off=0;
		var fe=ff.fe;
//		print("repo0 off",off,"fe",fe);
		var ffac=off;
		while ((off+8)<fe){// in starting page (and cycling pages) find last stream
			var x=flatMap({read:1,s:off,l:8,ff:ff}),i=0;;
			for(;i<8;i++) if(x[i]!=0xFF) break;
			if(i==8) {ff.ae=off;	break;}
			if(i==4) {ffac=off+4;off+=4;continue;}			
			var kl=x[0], vl=x[1]*0x100+x[2];
			off+=kl+vl+3;
		}
		ff.ac+=ffac;
		ff.fe-=ffac;
		//	print("T - ffMap reposition ",1000*(getTime()-pf),"ms");
		//print("reposition end");
		
		/*
		var j=0;
		ff.curp=0;ff.ac=0;
		ff.fe=ff.af=ff.lp*ps;		// af : all flash available, cycling/end limit address	// fe : bytes left in flash from ae											
		for(;j<ff.af;j+=ps) {
			print("1 repo ",j);
			j=ffMap({fiXX:1, s:j, e:ff.af, d:ps, xl:8, ff:ff});
			print("2 repo ",j);
			if(j<ff.af) ff.curp=(j/ps+1)%ff.s;						// if page is blank, start at next
		}
		print("mid repo ",ff);
		ff.ac0=ff.ac=ff.curp*ps;	// ac0 : start page offset (from a0)					// ac : current stream offset (from a0)
		var off=0, ffac=0, poff=off;
		for(;off<ff.fe;off+=4) {
			off=ffMap({fiXX:1,s:off, e:ff.fe, d:4, xl:4, ff:ff});
			if((poff+4)==off) break;		// ae : end of stream offset (from a0)
			else ffac=off;
			if(off<fe) {poff=off;}
		}
		ff.ae=ff.ac+off;
		ff.ac+=ffac;
		ff.fe-=off;
		print("repo ended",ff);
		return;
		*/
		//	print("repo00 ps",ps);

		
		
	}
	
	
	
	
	
	
	
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////

	//reposition

//	print("--- ffMap : ",js(arg));
	var pf=getTime(); 
	var ff=arg.ff;

	///////////////////////////
	// create a new flatMap
	if(!ff || (!ff.fm && !ff.nomem) ){// create a new flatmap;
		ff.fm=flatMap(arg);
		if(ff.hash) ffMap({hadd:1,n:arg.n,s:2,inm:1,ff:ff});
		return ff;
	}


	var FL=arg.ff.sf;;
	/*
	///////////////////
	// write to flash
	if(arg.writ) { // arg : s:position rel to ae, v:value tab/string		// ret : 
		var ds=0, v=arg.v;

		for(var i=0;i<v.length;i++) {
			if(typeof(v[i])=="string") ds+=v[i].length; else ds++;
		}
		print("ds",ds);
		// calculate prefix
		var pre=(arg.s)%4;
		var post=pre+ds;
		if((post % 4)) post+=4-(post % 4);	
		var d=new Uint8Array(post);
		var s=0;
		while(s<pre) {d[s]=0xFF;s++;}
		print("pred",d);
		for(var i=0;i<v.length;i++) {
			if(typeof(v[i])=="string") {d.set(v[i],s);s+=v[i].length; }
			else {d[s]=v[i];s++;}
		}
		while(s<post) {d[s]=0xFF;s++;}
		var init=arg.s-pre;
		print("init",init,"ae",ff.ae,"s",arg.s,"ac",ff.ac,"pre",pre);

		ffMap({tost:1,reve:d,s:init,e:init+post,ff:ff});
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
		}*/
	//	print("FL",FL);
	/*		return;

	}
	
	/////////////////
	// tostring from flash
	if(arg.tost) {
		var s="";
		var d=arg.e-arg.s;
		var ij=ff.ac+arg.s;
		if(ff.curp>2 && ij>ff.fa) ij-=ff.fa;
		var fe=ij+d,fe0=fe;
		if(ff.curp>2 && fe>ff.fa) fe-=ff.fa;
		var i=0;
		print("ij",ij,"fe",fe);

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
				print("tost k",k,ij,e,fe);
				s+=k;
			}
			//	return;
			if(e<fe) ij+=64; 
			else if(fe!=fe0) {ij=0;fe=fe0;}//cycle
			else break;
		}
		return s;
	}
	//////////////////////////////////////
	// read item from flash		 
	if(arg.rite) {		
		var off=arg.s;
		var x2=ffMap({read:1,s:off,l:3,ff:ff});
		//FL.read(3, ff.ac+off);			
		var kl=x2[0];
		var vl=x2[1]*0x100+x2[2];
		off+=3;
		var e=off+kl;
		var k=ffMap({tost:1,s:off,e:e,ff:ff});			 
		// for each element
		var v;
		if((arg.n && k==arg.n) || !arg.n) {	
			v=ffMap({tost:1,s:e,e:e+vl,ff:ff});
		}			
		return {n:k, v:v,vl:vl};
	} 
	 */

	/////////////////////////////////////
	// append or set at position in flash 		
	if(arg.setf) {
		var kl=arg.n.length,le=arg.v.length;
		var tab=[kl,arg.v.length/256,arg.v.length,arg.n,arg.v];
		flatMap({writ:1,v:tab,s:ff.ae,ff:ff});
		if(ff.hash) ffMap({hadd:1,n:arg.n,s:ff.ae,ff:ff});
		ff.ae+=kl+arg.v.length+3;
		print("ff.ae updated to ",ff.ae,arg.v.length,kl,typeof(arg.v));
		return;
	}


	////////////////////
	// add to hash table
	if(arg.hadd) { // two modes: uint8array or associative array	// arg : n:key, s:position, inm:inmemory(not in flash),ff.hash, ff.hmod:1 for array, 2 for Uint8Array			
		var hchk=32;
		if(ff.hash==1) {ff.hmod=ff.hash;ff.hash={};}//create array hash
		if(ff.hash==2) {ff.hmod=ff.hash;ff.hash=new Uint8Array(hchk);ff.hl=0;}

		var hd=0;
		for(var i=0;i<arg.n.length;i++) {hd+=arg.n.charCodeAt(i);}// hashing name of the key to add

		var pos=arg.s & 0xFFFF; // reduce to 16bits
		//var inm=arg.inm | 0;
		print("adding hash for",hd,arg.n);
		print("pos",pos);
		if(ff.hmod==1) {
			var pp=pos+(arg.inm|0)*0x10000;
			print("pp",pp);
			if(ff.hash[hd]) {
				var t,it=ff.hash[hd];
				if(typeof(it)=="number") t=[it];
				else t=jp(it);
				t.push(pp);	
				ff.hash[hd]=js(t); 	
			}
			else ff.hash[hd]=pp;// add a 17bit	
		}
		print("ff.hmod",ff.hmod);
		if(ff.hmod==2) {
			var cell=5;	
			if((ff.hl+cell)>ff.hash.length) {//if too small, reallocate and copy
				var h2=new Uint8Array(ff.hash.length+hchk); 
				h2.set(ff.hash);
				delete ff.hash;
				ff.hash=h2;
			}
			ff.hash.set([hd/0x100,hd,arg.inm,pos/0x100,pos],ff.hl);
			print("saved hash for",arg.n,ff.hash);
			ff.hl+=cell;	
		}
		return;
	}	


	///////////////////////
	// get from hash table
	if(arg.hget) {
		var hd=0;
		for(var i=0;i<arg.n.length;i++) {hd+=arg.n.charCodeAt(i);}// hashing name of the key to add
		if(ff.hmod==1) {
			var fh=ff.hash,s=arg.s | 0x10000;
			if(arg.msh) {
				for(var k in fh) {
					var e=fh[i];
					if(typeof(e)==number) if(e>s) e+=arg.msh;
					else {var c=0;
						e=jp(e);	
						for(var i in e) if(e[i]>s) {e[i]+=arg.msh;c=1;}
						if(c) fh[i]=js(e);
					}
				}
				return;
			}			
			
			var e=fh[hd];
			if(e) {
				if(arg.del) {delete ff.hash[hd];return;}
				if(typeof(e)=="number") e=[e];
				else e=jp(e);
				print("e",e);
				for(var i in e) e[i]={s:e[i]&0xFFFF,m:Math.floor(e[i]/0x10000)};		// return {s:offset,m:in memory} 
			}
			print("returning hash",e,fh,hd);
			return e;
		}
		//		print("ffhmod",ff.hmod);
		if(ff.hmod==2) {
			var cell=5,t=[],d=[];var fh=ff.hash;
			if(arg.msh) {
				for(var i=0;i<ff.hl;i+=cell) {
					if(fh[i+2]) {
						var s=fh[i+3]*0x100+fh[i+4];
						if(s>arg.s) {s+=arg.msh;fh[i+3]=s/0x100;fh[i+4]=s;}
					}
					
				}
			}
			
			print("ff.hl",ff.hl);
			for(var i=0;i<ff.hl;i+=cell) {				
		//		print("fh[i]",fh[i],"hd",Math.floor(hd/0x100));
		//		print("fh[i+1]",fh[i+1],"hd",(hd & 0xFF));
				if(fh[i]==Math.floor(hd/0x100) && fh[i+1]==(hd & 0xFF)) {t.push({s:fh[i+3]*0x100+fh[i+4],m:fh[i+2]});d.push(i);
			}
			if(arg.del) {
				for(var i in t) {
					fh.set(fh.slice(i+cell,ff.hl),i);ff.hl-=cell;
					}
				}
			}

			//	print("returning hash",t,ff.hl);
			if(t.length>0) {print("returning hash",arg.n,t);return t;}
			else return;
		}
		return;
	}



	/////////////////////////////////////
	// search and merge in flash, then in mem 
	if(arg.srch) { 
		var pf=getTime();   
		// search in flash		
		var fe=ff.ae;// find key
		var off=arg.s || 0;
		var v=0,s=-1,ht=0,oft=0,ih=0;
		if(ff.hash==1 || ff.hash==2) ht=1; //first time
		else if(ff.hash) oft=ffMap({hget:1,n:arg.n,ff:ff}); 	// search in hashtable instead
		var mm=0;
		if(oft) {off=oft[ih].s;mm=oft[ih].m;ih++;}
//		print("search for",arg.n, off,fe);
		var fim=0, fif=0,vil=0;
		while(off<fe  || oft) {
			var o=0;
			if(!mm) o=flatMap({rite:1,s:off,n:arg.n,ff:ff});
			else o=flatMap({srch:1,s:off,n:arg.n,fm:ff.fm});
			if(o && ht) ffMap({hadd:1,n:arg.n,s:o.s,inm:mm,ff:ff});
			print("search for2",arg.n, off,fe);
			
		//	print ("ffMap srch item",o);
			//print ("item",o.n, o.v, s);
			
			if(o.v) {				
				o.v=jp(o.v);
				if(o.v.del && o.v.del==1) {v=0;s=-1;f=0;}//item deleted
				else {
					if(!v) v=o.v;
					else for(var kp in o.v) v[kp]=o.v[kp];	
			//		print("item found v",v,off,mm);
					if(!mm) fif++;
					else fim++;
					if(s<0) s=off;
					if(!vil) vil=3+o.n.length+o.vl;
					f=1;										
				}
			}
			if(oft) {if(ih>=oft.length) break; else{ off=oft[ih].s;mm=oft[ih].m;ih++;}}
			else off+=3+o.n.length+o.vl;
			if(off>=fe && !oft) break;
		}
		var ms=0;
	//	print("ff.hash",ff.hash);
		if(!ff.nomem && !ff.hash) {ms=flatMap({srch:1,n:arg.n,fm:ff.fm});}	 
		if(ms) {
			if (!v) {v=jp(ms.v);s=ms.s/* | 0x10000*/;vil=3+arg.n.length+ms.v.length;fim++;}
			else {
				for(var kp in ms.v) {v[kp]=ms.v[kp];}
			}
		}
		print("T - ffMap search ",1000*(getTime()-pf),"ms");
		if(v) return {n:arg.n,v:v,s:s,fim:fim,fif:fif,is:s+vil};  // s is first occurence index of key 

		return ;
	}



	/////////////////////////////
	// iterate
	var e;
	if(arg.first || arg.next) {	//must cycle too
		var pf=getTime();
		var off=ff.ac;
		if(arg.s) off=arg.s;		//

		// read first entry
		var r,s=arg.s||2;
		//print("prerite",off,ff.ae,ff.ac);
		if(ff.ae>ff.ac) {if(off<ff.ae) r=flatMap({rite:1,s:off,ff:ff});}	// switch to 10000 adresses for flat map
		else r=flatMap({fm:ff.fm,next:1,s:s});
		print("r",r);
		if(!r) return;
		// find following updates
		var o=ffMap({srch:1,n:r.n,ff:ff});	// must iterate flash then memory items absent from flash >> use the first met address to know if met before
		print("ffMap iterate",o);
		if(o.s<off) {return;}
		off=o.is;
		print("T - ffMap iterate  took ",1000*(getTime()-pf),"ms");
		return {n:r.n,v:o.v,ni:r.ni||off};
 		 
	}

	
	
	
	
	
	///////////////////////////////////
	// Function sync : summerize the flash
	if(arg.sync) {
	print("Syncing Starting ");
		var n=ffMap({first:1,ff:ff});
	//	print("Syncing Started ",n);
		var nm;
		while(n) {
			print("Sync iterate ",n);// supposed n.n key, n.v value, n.i index, n.ni nextindex			
		//	nm=flatMap({n:n.n,v:n.v,fm:nm});
			n=ffMap({next:1,s:n.ni,ff:ff});
		}
	//	print("nm",nm.toString());
		
		// take one by one
			// if no space left, write in a new flatmap, reset then writeit down by slice
			// if space left after stream (2*(ae-ac+4)<ff.fe), write there
			// if space available on swap page ( l>1, !noswap, if l>3 2swap pages), write there be careful for ending
				// on swap page reset before write
		return;
	}
	
	
	
	
	/////////////////////////////////////
	// Function add, update, TODO: delete
	/*	arg :{
	ff:{
	-provided
	fm:map,a0:address,s:sizeinpages, nomem:1useonlyflash
	-stored
	ac:currentoffset, ae:endofstreamoffset,curp:currentstartpage}
	}*/


	if(arg.ff) {
		var ff=arg.ff;
		print("T - ffMap pre-reposition ",1000*(getTime()-pf),"ms");

		if(!ff.af) {//ff.af cannot be 0
			ffMap({repo:1,ff:ff});
			print("ff.ac",ff.ac);
		}
//		print("T - ffMap post-reposition ",1000*(getTime()-pf),"ms");

		// search value
		// search in mem
		///	var ms;
		//	if(!ff.nomem) {ms=flatMap({srch:1,n:arg.n,fm:ff.fm});}	 
		// search in flash
		var fs=ffMap({srch:1,n:arg.n,ff:ff}),of=0;	
		// fuse the two
		print("fs",fs);
		if(fs) of=fs.v; 
		// of is result
		var v=arg.v;
//		print("used value",v);
		if(!v) return of;	
		else {	
			print("of",of,v);
			print("of",typeof(of),typeof(v));
			if(of) {	//update	// keep only new keys/values
				var v2={};
				for(var kp in v){
					if(!of[kp] || of[kp]!=v[kp]) v2[kp]=v[kp];
					print("kp",kp,v2[kp],v[kp]);
				} 
				v=v2;
			}	
//			print("of v",v);
			
			if(v.del && v.del==1){	// update later items mem hashes after delete and update
				print("fif",fs.fif,"fim",fs.fim);
				if(fs.fim>0) {				 					 
					var a={fm:ff.fm, n:arg.n,del:1};
					 ff.fm=flatMap(a); 
					if(ff.hash) ffMap({hget:1,n:arg.n,s:a.s, msh:a.d,ff:ff});
				//	print("ff.fm",ff.fm);
					}
				if(fs.fif>0) ffMap({setf:1,n:arg.n,v:{del:1},ff:ff});
				if(ff.hash) ffMap({hget:1,n:arg.n,del:1,ff:ff});
			} else {
				if(!ff.nomem) {
					var a={n:arg.n,v:v, fm:ff.fm};
					ff.fm=flatMap(a);		 
					if(ff.hash && a.s) ffMap({hadd:1,n:arg.n,s:a.s,inm:1,ff:ff});} //write down in mem
				else {
					v=js(v);
					print("setting in flash ",arg.n,v);
//					print("setting flash",arg.n);

					ffMap({setf:1,n:arg.n,v:v,ff:ff}); // in flash no pos mean at end of stream			
				}
				
			}

		}
		/*
		if(arg.sync) {
			var n=ffMap({fm:m,first:1});
			while(n) {
				print("iterate ",n);// supposed n.n key, n.v value, n.i index, n.ni nextindex
				ffMap({setf:1,n:n.n,v:v,ff:ff});
				n=flatMap({fm:m,next:1,s:n.ni});
			}
		}
		*/
		// if space available direct copy item by item
		
		/*		if(arg.comp) {


		}
		 */
		print("T - ffMap end ",1000*(getTime()-pf),"ms");
	}





}

exports.ffMap=ffMap;




//add another value or update on previous map
//if flash not empty
//find/accumulate in flash
//if mem mode, remove flash same value, add it to map as more recent value
//if no mem mode remove flash same value, and post it at the end of stream

//get a value from key
//if flash not empty
//find/accumulate in flash
//if mem mode, find in mem and add it
//return the result

//purge 
//if flash not empty
//find/accumulate in flash
//find in mem and substract it and post it at the end

//summarize
//if flash not empty
//find/accumulate in flash
//add mem elem
//if no swap page and no space left, keep in memory untill end and reflash all 
//if space left, postit at end of main page as new stream
//if no space left and swap page,  postit in end of swap page (erased if needed), update current page, erase old page

/*
//FFmap
var ad=require("Flash").getFree()[3].addr;
var pl=require("Flash").getPage(ad).length;

var sf=new SimiliFlash(ad);

var m=flatMap({n:"humidity",v:{m:2,st:1,name:"humid"}}); //add

var ft={ft:m, ac:ad, a0:ad, a1:ad+pl, sf:sf};	//use these two pages and this map

ffMap({n:"temperature",v:{m:2,st:1,name:"hot"},ft:m,addr:ad,sf:sf}); //add


//sync to flash
ffMap({sync:1,ft:ft,addr:ad,sf:sf});

//find from flash
var o=ffMap({ft:m, n:"humidity",addr:require("Flash").getFree()[3].addr});
print("o",o);
ffMap({n:"temperature",v:{m:2,st:1,name:"hotter"},ft:m,addr:ad,sf:sf}); //update

o=ffMap({ft:m, n:"temperature",addr:require("Flash").getFree()[3].addr});

print("o",o);

ffMap({n:"temperature",v:{m:2,st:1,name:"hotter"}}); //add
o=ffMap({ft:m, n:"temperature",addr:require("Flash").getFree()[3].addr});
print("o",o);


////////////////////////////////////////////////

start=function(){

  var flatMap=require("FlatMap").flatMap;
  var ffMap=require("FlatMap").ffMap;
  var SimiliFlash=require("FlatMap").SimiliFlash;

	var pf=getTime();
	var a={n:"humidity",v:{m:2,st:1,name:"humid"}};

	var m=flatMap(a);

  var ad=require("Flash").getFree()[3].addr;
  var pl=require("Flash").getPage(ad).length;

  var sf=new SimiliFlash(ad);

	var ff={fm:0, a0:ad, lp:1, nomem:0, sf:sf};
	var m=ffMap({n:"humidity",v:{m:2,st:1,name:"humid"},ff:ff}); //add	// must create the mem zone and store it there

	//var 
	ff={fm:0, a0:ad, lp:1, nomem:1, sf:sf}; 	
	var m=ffMap({n:"humidity",v:{m:2,st:1,name:"humid"},ff:ff}); //add	// must write direct to flash


};

setTimeout(start,2000);






 */




