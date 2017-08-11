

function MemO() {
	this.saved;
	console;   
};
exports = MemO;

MemO.prototype.save = function() { 
	this.saved=E.getSizeOf(global, 2);
	console.log("mem:"+JSON.stringify(this.saved));
	delete console; delete JSON;
};
MemO.prototype.clear = function() { 
	this.saved=undefined;
	console.log("mem cleared");
	delete console; 
};

MemO.prototype.diff = function() {
	if(this.saved===undefined) return;
	var newmem=E.getSizeOf(global, 2);

	for(var i=0;i<newmem.length;i++) {
		var j=0;
		for(;j<this.saved.length;j++) {
			if(this.saved[j].name==newmem[i].name) break;
		}
		if(j<this.saved.length){
			if(this.saved[j].size==newmem[i].size) console.log("memdiff:nam:"+JSON.stringify(newmem[i].name)+" same size !");
			else{
				//console.log("memdiff:nam:"+JSON.stringify(this.newmem[i].name)+" growth of "+this.newmem[i].size+" "+this.saved[j].size);
				console.log("memdiff:nam:"+JSON.stringify(newmem[i].name)+" growth of "+(newmem[i].size-this.saved[j].size));
			}
		} 
		else {
			console.log("memdiff:nam:"+JSON.stringify(newmem[i].name)+" new ");			
		} 
	};
	delete console; delete JSON;
};

