
//IOData memory usage : 
//- module (code) = 52 block
//- execution ~   block
//- 60 block when creating object
//- 10 block for the array of data
//- data array = 4 + 13 block per ionode
//- left after first execution
//- 5 blocks for module prototype declaration 
//- 6 blocks for Array on global scope

// string take less mem than arrays
// argyuments take the most space in function delaration mem

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


function upCR(arg,tab,o){ 
	// arg is arguments
	// tab is table name
	// o is object holding table, to write 
//		print("arg "+js(arg));
	//	print("hello2 "+o.nodes);
		var l=Object.keys(arg).length;
		delete Object;
		if(l===0) return;		
		var tstr=o[tab];
	//	print("hello3 ."+tstr+".");
		if(tstr.length==0) o[tab]="['"+js(arg)+"']";
		else {
			var tabarray=JSON.parse(tstr);
			var index=0;
			var i=tabarray.map(function(e) { index++;
				e=jp(e); //print("item "+index +" :");print(e);
				return e["name"]; }).indexOf(arg["name"]);
			if(i!=-1) {// found item
				var it=jp(tabarray[i]);
//				print("item found :"+js(it) );
				for (var key in arg) {it[key]=arg[key];}
//				print("item changed to :"+js(it) );
				// for each field of arg copy val and key to o.tab.item
				tabarray[i]=js(it);
			} else tabarray.push(js(arg));
			o[tab]=js(tabarray);
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

IOData.prototype.updateNode =  function(e) { // arg: {name:"Humidity", type:"input", unit:"\%", val:"-99"}
	//print("hello1.7 "+JSON.stringify(this));
	upCR(e,"nodes",this);		
};
IOData.prototype.updateRule =  function(e) {
	print("IOData.prototype.updateRule: "+JSON.stringify(e));

	upCR(e,"rules",this);	
	print("IOData.prototype.updateRule: rules: "+JSON.stringify(this.rules));

};

exports = IOData;


