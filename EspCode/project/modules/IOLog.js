
var js=JSON.stringify;
var jp=JSON.parse;


function IOLog(arg){
//	print("IOLOG called",arg);
	fileo={pre:"/log/",cur:"-cur", maxsync:250, maxfiles:5};
	
	var val=arg.it;
	var mm=arg.mm;
	
	
	//////////////////////////////////////////
	// get next void tag	(should use dichotomy instead)
	
	if(arg.ftag) {
		var addr=arg.addr,offset=arg.offset,limit=arg.limit, tagsize=arg.tags, dir=arg.dir;
		var FL=require("Flash");
//		print("findTag ",tagsize,addr,offset,limit,dir);
		var end=false;
		while(!end && (offset+tagsize)<limit && offset>=0){				
			var ix=FL.read(tagsize,addr+offset);
	//		print("findTag >> ",dir, offset,ix);
			var restart=-1,i=tagsize-1,c=true;
			if(!dir) i=0;
			ix.forEach(function(){if(ix[i]!= 0xFF && restart==-1) {restart=i;};if(!dir) i++;else i--;});
			
//			for(var i=tagsize;i>=0;i--) if(ix[i]!= 0xFF) {restart=i;break;}
//			print("restart",restart);
			if(restart!=-1) {
				if(dir) offset+=1+restart;
				else {offset-=tagsize-restart;}
			}
			else end=true;
//			console.log("restart",restart,offset);
		}
		return offset;
	}
	
	//////////////////////////////////////////
	// get Flash time 
	if(arg.flt){
		var prof=(Date().getTime()).toFixed();
		var FL=require("Flash");
		var fts=0;
		function getNumber(arr,i0,nu){
			var ret=0,m=1;
			for(var i=nu-1;i>=0;i--) {ret+=arr[i0+i]*m;m=m*256;}
			return ret;
		}
		FS=mm.fs;
		//find file
		for (var l in FS.items) {
			if(l.indexOf(fileo.pre)!=-1 && l.indexOf(fileo.cur)!=-1)	{
				print("found log file to use for sync",l);
				var item=jp(FS.items[l]);
				var il=item.l;
				// open at offset,find XXXX XXXX : root is not always saved
				var lastns=-1;
				var addr = parseInt(FS.addr + item.p * FS.page_size), lim=FS.page_size;
				offset=il,poffset=-1;
				while(offset>0){	
				//	offset=findTag(addr,offset,lim,4,1);
					offset=IOLog({ftag:1,addr:addr,offset:offset,limit:lim,tags:4,dir:1});
	//				print("findTag",offset);
					if(poffset!=-1) {
						if((poffset+4)==offset ) {offset-=4;break;}
						else lastns=poffset;
					}
					poffset=offset;
					offset+=4;			
				}			
				item.l=il=offset;	// updates file length (in memory only)
				FS.items[l]=js(item);
				if(lastns==-1) {
	//				print("backward", offset);
				//	offset=findTag(addr,offset-4,lim,4,0);
					offset=IOLog({ftag:1,addr:addr,offset:offset-4,limit:lim,tags:4,dir:0});
					if(offset<0) lastns=0;
					else lastns=offset;
				}
				if(lastns>0) lastns+=4;
				// read mode
				var m= FL.read(1, addr+lastns),ts=-1;
				// if dirty ts use anyway
				m= m[0] & 127; // unset dirty byte
				// if mode <2 read ts and interval
//				print("m",m);
				if(m<2) {
					var vl=2,bts,binter;
					if(!m) vl++;
					var dat=FL.read(11,addr+lastns+1);
					bts=getNumber(dat,0,7);
					binter=getNumber(dat,7,4);
					if(m) ts=bts+binter*(il-(lastns+12))/vl;
					else {// sum all repetitions !
						var off=lastns+12+2,sumrep=0;
						while(off<il) {sumrep+=1+getNumber(FL.read(1, addr+off),0,1);off+=3;}
						ts=bts+binter*sumrep;
					}
				}
				// read end
				if((m==2 || m==3) && il>7) ts=getNumber(FL.read(7, addr+il-7),0,7);
				// save ts
				if(ts>fts) fts=ts;
				print("Found ts:",ts,"-", (new Date(ts)).toString());
			}
			
		}
		// compare tses keep the latest
		print("Final ts:",fts, "-",(new Date(fts)).toString());
		print("executed in",(Date().getTime()).toFixed()-prof,"ms");
		return fts;
	};
	
	
	////////////////////////////////
	// main function
	if(val && mm){
		var FL=require("Flash");
		print("######logger will save to flash",val);

		var prof=(Date().getTime()).toFixed();

		// Choose the right file : with '-cur' that is not finished or create a new

		var k=val.k,m=val.m , FS=mm.fs,FF=mm.flashfile,FI=fileo;	 

		var n,f=0, newstream=true, offset=0,msync=FI.maxsync;
		var ni=0, hi=0;

		var dsiz=0;//data size	// TODO move part of it to beginning to be minbytes according to mod
		if(!m) dsiz+=3;
		if(m==1) dsiz+=2;
		if(m==2 || m==3) dsiz+=7; 
		if(m==4) dsiz+=7; 


		if(!FF[k]) {
			for (var l in FS.items) {if(l.indexOf(FI.pre)!=-1 && l.indexOf(k)!=-1 && l.indexOf(FI.cur)!=-1)	{f=1;print("found log file",k,l);n=l;break;}}
		//	print("f",f);
			if(f) {
				var item=jp(FS.items[l]);
				hi=item.l;			 
			//	offset=findTag(FS.address(FS.items[n].page),hi,FS.page_size,8,1);(addr,offset,limit, tagsize, dir)
				offset=IOLog({ftag:1,addr:parseInt(FS.addr + item.p * FS.page_size),offset:hi,limit:FS.page_size,tags:8,dir:1});
		//		print("offset",offset);
				hi=offset-hi;
				item.l=offset;
				FS.items[l]=js(item);
				if(offset>0) offset+=4;
			}
		} else {
			offset=FF[k].off;n=FF[k].name;	
			if(FF[k].mode!=m) {offset+=4;}
			else newstream=false;}
		if(newstream){if(m<2) dsiz+=1+7+4; else dsiz++;}
//		print("dsize",dsiz);
		if((offset+dsiz)>FS.page_size) {	//file exist but full
			print("*************LOG FILE FULL !");
			var sp=n.replace(FI.cur,"").split("/");
			ni=parseInt(sp[sp.length-1],10);	
			FS.items[FI.pre+k+"/"+ni]=FS.items[n];	// rename /n-cur to /n
			delete FS.items[n];
			if((ni+1)>FI.maxfiles) ni=0; else ni++;
			var nn=FI.pre+k+"/"+ni;
			n=nn+FI.cur;
			if(FS.items[nn]) {				// reuse existing file
				FS.items[n]=FS.items[nn];	// rename /n+1 to /n+1-cur
				delete FS.items[nn];
				var it=jp(FS.items[n]);
				it.l=0;
				FS.items[n]=js(it);
				FS.erasePages(it.p,1); // erase its page to rewrite it from start
				f=1;
				print(FS);
			} else f=0;
			msync=0;
			if(!newstream) {newstream=true;if(m<2) dsiz+=1+7+4; else dsiz++;}
			offset=0;
			if(FF[k]) delete FF[k];

		}
//		print("f",f);

		if(!FF[k]){/// create new log file
			if(!f) {n=FI.pre+k+"/"+ni+FI.cur;print("will create new flash entry ",n);FS.store(n,"","application/octet-stream");print("created new flash entry ",n);}		// create a file with no content (1page reserved)
			FF[k]={name:n,off:offset,sync:msync-hi};
			print(FS);
		}

 		print("FS.items[n]",FS.items[n]);

		var item=jp(FS.items[n]);

		if(!item) return null;
//		var addr = FS.address(item.page);
		var addr=parseInt(FS.addr + item.p * FS.page_size);
		//////////////////
		// write the data

		// reset stream if mode change

//		if(FF[k].mode!=m && !newstream) {offset+=4;newstream=true;}
		FF[k].mode=m;

		var dec=(addr+offset) & 3;

		
//		print("offset",offset,dec);
		offset-=dec;
		
		dsiz+=dec;//data size	// TODO move part of it to beginning to be minbytes according to mod

		if((dsiz % 4)) dsiz+=4-(dsiz % 4);	// round to higher multiple of 4
		//print("tsiz",tsiz);
		function getUint8(num,nu){
			var ar=new Uint8Array(nu);				
			for(var i=nu-1;i>=0;i--) {ar[i]=num;num=num/256;}
			return ar;
		}
		var out=Uint8Array(dsiz), inde=0;
		while(inde<dec) {out[inde]=0xFF;inde++;}
//		if(dec) {out.set(dect);inde+=dec;}

		if(m==4) {// highest bit is for unsynced, dirty ts
			// use latest ts or ts+interval to dirty resync time
			// when retreiving, resync with first next clean ts with a mode4 8byte diff
			// mode 0 : ts+interval+(val,rep), 
			// mode 1: ts+interval, val(no rep), 
			// mode 2 : ts every data(no interval, no val, start at val 0 (mode3 start with 1)) 
			// mode 4 : resync, 7 diff + mode 1/2/3 prefixed/interrupts to a normal stream
			out[inde]=m;inde++; 
			out.set(getUint8(val.diff,7),inde);inde+=7;
		} else {
//			print("inde0",inde);
			if(newstream) {	
				if(val.unsync) out[inde]=m|128;	//dirty st
				else out[inde]=m;
				inde++; 	
//				print("inde1",inde);
				if(m<2){
					// ts 7bytes, interval 4 bytes
					out.set(getUint8(val.ts,7),inde);inde+=7;
//					print("inde2",inde);
					//write val as 32 int
					out.set(getUint8(Math.round(val.inter),4),inde);inde+=4;
				}
			}
//			print("inde3",inde);
			if(m<2) {out.set(getUint8(val.v,2),inde);inde+=2;}
			if(m==2 || m==3) {out.set(getUint8(val.ts,7),inde);inde+=7;} // ts 7bytes, 
//			print("inde4",inde);
//			print("out3",out,val.v);
			if(m==0) {out[inde]=getUint8(val.rep,1);inde+=1;}
//			print("out4",out,val.rep);
		}
		for (var i=inde;i<dsiz;i++) out[i]=0xFF;
		print("at",addr,offset,"\nout",out,out.length);
//		pre and post fill

//		data=data&3;
//		var ix2=FL.read(dsiz,addr+offset);
//		print("before write ix2",ix2,dsiz);
		var bad=false;
		for(var i=dec;i<dsiz;i++) if(ix2[i]!= 0xFF) {bad=true;break;}

		if(!bad){ 
			FL.write(out, addr+offset);
			print("Flash written",out.length,addr,offset);
			FF[k].off=offset+inde;}
		else print("Error : Flash address already written");
//		ix2=FL.read(dsiz,addr+offset);
//		print("after write ix2",ix2,dsiz);
		print("FF[k]",js(FF[k]));
		FF[k].sync-=FF[k].off-item.l;
		if(val.sync) FF[k].sync=val.sync;
		item.l=FF[k].off;
		FS.items[n]=js(item);
		print("######logger executed in",(Date().getTime()).toFixed()-prof,"ms");
//		if((FF[k].sync)<=0){this.fs.sync();print("Synced FS !");FF[k].sync=msync;}

	};
	
	
}



exports=IOLog;
