
// leave only E behind

exports.memDiff = function(nmem,mempassed) { 
	
 		var newmem=nmem;
		var stack= new Array();
		var path="/";
	 	var count=0;
		for(var i=0;i<newmem.length;i++,count++) {
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
			if(e!==undefined){				
				if(e.size==newmem[i].size) console.log("MemF "+count+" - "+path+newmem[i].name+" - same size :"+e.size+s);
				else console.log("MemF "+count+" - "+path+newmem[i].name+" - change of "+(newmem[i].size-e.size)+", size :"+newmem[i].size+s);
			} else console.log("MemF "+count+" - "+path+newmem[i].name+" - new, size :"+newmem[i].size+""+s+" *");			
			
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
		delete console; 


};



