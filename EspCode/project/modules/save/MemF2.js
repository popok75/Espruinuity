
// leave : only E behind

// MemF memory usage : 
// - as module (code) = 62 block
// - during execution ~ 330 block
//		- empty mem, 4 levels : 150 per arg (60 stringified) = 300
//		- 30 blocks more during process 

// - stringify stored mem image if kept for long

exports.memD = function(nmem,mempassed) { 
	print("1.5-"+JSON.stringify(process.memory()));
	 	var newmem=nmem;
		var stack= new Array();
		var path="/";
	 	var count=0;
	 	for(var i=0;i<newmem.length;i++) {
	 		var tp;
			var e=undefined;
			var tab=mempassed;
			var stop=false;
			for(var p=0;p<stack.length && !stop;p++) {
					var found=-1;
					for(var j=0;j<tab.length;j++) if(tab[j].name===stack[p][1]) {found=j;break;}
					if(found>=0 && tab[found].more!==undefined) tab=tab[found].more;
					else stop=true;				
			}
			for(var j=0;j<tab.length;j++) if(tab[j].name===newmem[i].name) {e=tab[j];}
			
			var s="";if(newmem[i].size>10) s=" <-";			
			tp="MemF "+(count++)+" - "+path+newmem[i].name+" : "+newmem[i].size;
			if(e!==undefined){				
				if(e.size==newmem[i].size) tp+=" - same";
				else tp+=" - change of "+(newmem[i].size-e.size);
			} else tp+=" - new "+" *";
			print(tp+" "+s);
			
			if(newmem[i].more!==undefined && newmem[i].more.length>0) {//stack
				stack.push([i,newmem[i].name]);
				path=path+newmem[i].name+"/";
				newmem=newmem[i].more;
				i=-1;
			}
			while((i+1)==newmem.length && stack.length>0) {//unstack			
				i=stack.pop()[0];
				newmem=nmem;
				path="/";
				for(var k=0;k<stack.length;k++) 
					{path=path+newmem[stack[k][0]].name+"/";
					newmem=newmem[stack[k][0]].more;
					} 
			}
			
		}

		delete stack;
		delete Array;
		
		/* Recursive, but too much mem for stack
		var p=[], pt="", pe, tp,s,co=0,el;
		var fn=function(e){
			pe=mempassed;
 			p.some(function(a){
				el=pe[pe.map(function(e) { return e.name; }).indexOf(a)];
 				if(el===undefined) pe=undefined; else pe=el.more;
				return (pe===undefined);
				});
			if(pe!==undefined) pe=pe[pe.map(function(e) { return e.name; }).indexOf(e.name)];
			if(p.length>0) pt="/"+p.toString().replace(",", "/")+"/";
			else pt="/";
			tp="MemF "+(co++)+" - "+pt+e.name+" : "+e.size;
			if(e.size>10) s=" <-"; else s="";	
			if(pe!==undefined){				
				if(e.size==pe.size) tp+=" - same "+s;
				else tp+=" - change of "+(e.size-pe.size)+" "+s;
			} else tp+=" - new "+" * "+s;
			print(tp);
			if(e.more!==undefined) {p.push(e.name);e.more.forEach(fn);p.pop(e.name);}	
		};
		nmem.forEach(fn);
		delete Array;
	*/	

};



