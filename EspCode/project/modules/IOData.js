
//IOData memory usage : 
//- module (code) = 52 block
//- execution ~   block
//- 60 block when creating object
//- 10 block for the array of data
//- data array = 4 + 13 block per ionode
//- left after first execution
//- 5 blocks for module prototype declaration 
//- 6 blocks for Array on global scope

//objects
function IONode(d){
	this.type=d.type;
	this.name=d.name;
	this.val=d.val;
	this.unit=d.unit;
}

function IORule(r){
	this.name=r.name;
	this.cvar=r.cvar;
	this.ccomp=r.ccomp;
	this.cval=r.cval;	
	this.actvar=r.actvar;
	this.actval=r.actval;
}
var js=JSON.stringify;
var jp=JSON.parse;


function upCR(n,fi,o){

	//	print("hello2 "+o.nodes);
		var l=Object.keys(n).length;
		delete Object;
		if(l===0) return;		
		var tstr=o[fi];
	//	print("hello3 ."+tstr+".");
		if(tstr.length==0) o[fi]="['"+js(n)+"']";
		else {
			var l=JSON.parse(tstr);
			var i=l.map(function(e) { e=jp(e); return e.name; }).indexOf(n);
			if(i!=-1) {
				l[i];
				for (var k in n) {l[i][k]=e[k];}
			} else l.push(js(n));
			o[fi]=js(l);
		}

	};

function IOData() { 
	// 3 arrays
	//		- inputs
	//		- outputs
	//		- rules
//	this.nodes=new Array();
//	this.rules=new Array();
	this.nodes="";
	this.rules="";

	// must have a function to add a input (for now by method call)
	// add an output and register a callback 

}

IOData.prototype.updateNode =  function(e) {
	//print("hello1.7 "+JSON.stringify(this));
	upCR(e,"nodes",this);		
};
IOData.prototype.updateRule =  function(e) {
	print("hello1.7 "+JSON.stringify(e));

	upCR(e,"rules",this);	
	print("hello1.8 "+JSON.stringify(this.rules));

};

exports = IOData;


