


exports.getHeader=function(str){
	switch(str){
	case "header": return "<!DOCTYPE html><html><head> <style> .pure-table { border-collapse: collapse; border-spacing: 0; empty-cells: show; border: 1px solid #cbcbcb } .pure-table caption {color:#888;font:italic 125%/1 Helvetica, sans-serif;padding:.5em 1;text-align: center} .pure-table td, .pure-table th { border-left: 1px solid #cbcbcb; border-width: 0 0 0 1px; font-size: inherit; margin: 0; overflow: visible; padding: .5em 1em } .pure-table td:first-child, .pure-table th:first-child { border-left-width: 0 } .pure-table td { background-color: transparent } .pure-table-odd td, .pure-table-striped tr:nth-child(2n-1) td { background-color: #f2f2f2 } .pure-table-bordered td { border-bottom: 1px solid #cbcbcb } .pure-table-bordered tbody>tr:last-child>td { border-bottom-width: 0 } h1 { font-size: 1.75em; margin: .67em 0; } body { font-family: FreeSans, Arimo, 'Droid Sans', Helvetica, Arial, sans-serif; } </style> <meta name='viewport' content='width=device-width, initial-scale=1.0'><link rel='icon' href='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' sizes='32x32'> ";break;
	}
};

exports.getPre=function(str){
	switch(str){
	case "preinput":  return  "<table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Inputs</caption> <tr> <th >Input</th> <th >Value</th> </tr> </thead> <tbody>";break;
	case "preoutput":  return "<br><table class='pure-table pure-table-bordered pure-table-striped'> <thead> <caption>Outputs</caption><tr> <th >Output</th> <th >Value</th> </tr> </thead><tbody>";break;
	case "prerule":  return "<table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Rules</caption> <tr> <th>Active</th><th >Name</th><th >Condition</th> <th>Action</th> <th>Delete</th></tr> </thead><tbody>";break;
	case "neo":  return "<table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Add rule</caption></thead><tbody><tr><td>Name</td><td>";break; //Condition : <select onChange='changeRule(1,this.value)'><option value='compare'>Compare</option><option value='timer'>Timer</option></select></td><td>Action : <select onChange='changeRule(0,this.value)'><option value='node'>on Node</option><option value='rule'>on Rule</option></select></td><tr id=neo>

	}
};



exports.addRule = function( rules, nodes){	//pb using dynamic change of form
	function gNN(s1,s2,n){
		n=jp(n);
		for(var i=0;i<n.length;i++){
			var e=jp(n[i]);var en={name:e.name};
			if(s2===0)  s1.push(en); 
			else {if(e.type==="input") s1.push(en); 
			else if (e.type==="output") s2.push(en);}	
		}
	};
	getDef=function(cond,act){
		function ctn(s,m){for(i=0;i<m.length;i++) {if(m[i].name==s) return true;} return false;};
		var s1=[],s2=[],am=[], gn="NewRule",w={name:gn, type:"rule", active:"0"},i,j=2;
		gNN(am,0,rules);
		gNN(s1,s2,nodes);	
		var s0=s2[0].name, am0=am[0].name;
		while(ctn(w.name,am)) w.name=gn+j,j++;
//		for(i=0;i<am.length;i++)if(am[i].name==w.name) w.name+=""+j; 
		if(cond=="compare")
			{ w=Object.assign(w,{ctype:"compare",cvar:s1[0].name,ccomp:"greaterorequal",cval:"85",actval:"0"});		
			if(act=="node") {w.acttype="node";w.actvar=s0;
			} else {w.acttype="rule";w.actvar=am0;}
			}
		else {w=Object.assign(w,{ctype:"timer",ts:"-1",t1:"25",t2:"10:00",cyc:"1",actval1:"0",actval2:"0"});
			if(act=="node") {w.acttype1=w.acttype2="node";w.actvar1=s0;w.actvar2=s0;
			} else {w.acttype1=w.acttype2="rule";w.actvar1=am0;w.actvar2=am0;}
			}
		if(rn.name!==undefined) {
			console.log("found previous",rn);
			w.name=rn.name;
			if(cond=="compare" && rn.ctype==cond) {	w.cvar=rn.cvar;w.ccomp=rn.ccomp;w.cval=rn.cval;w.actval=rn.actval;} 
			if(cond=="timer" && rn.ctype==cond) {w.t1=rn.t1;w.t2=rn.t2;w.cyc=rn.cyc;w.actval1=rn.actval1;w.actval2=rn.actval2;}
		}
		return w;
	};

	changeRule=function(v){
		var u=false,c=0, doc=document.getElementById("neo");
		if(v=="compare" || v=="timer") c=1;
		if(doc!==null) {
			rn ={ctype:sa};
			if(sa=="timer") rn.acttype1=sb,rn.acttype2=sb;
			else rn.acttype=sb;
			var ess = doc.firstChild.elements;
			for(var i = 0 ; i < ess.length ; i++){
				var it = ess.item(i);
				if(it.name=="rule") rn["name"] = it.value;
				else rn[it.name] = it.value;					
			}
//			console.log("updated rn",rn);
		}
		if(c==1 && v!=sa) {sa=v;u=true;} 
		if(c==0 && v!=sb) {sb=v;u=true;}
		if(u){
			rn=getDef(sa,sb); 
			document.getElementById("neo").innerHTML=getRuleHtml(rn, rules, nodes, true);
		}
	};
	
	function gOpt(v,t,v2,t2){
		function gO(b,y){return "<option value='"+b+"'>"+y+"</option>";}
		return "<select onChange='changeRule(this.value)'>"+gO(v,t)+gO(v2,t2)+"</select>";
	};
	var ret=getPre("neo");
	ret+="Condition : "+gOpt("compare","Compare","timer","Timer")+"</td><td>Action : "+gOpt("node","Node","rule","Rule")+"</td><tr id=neo>";
	sa="compare";sb="node";	rn={};
	rn=getDef(sa,sb);
//	console.log("before rulehtml");
	ret+=getRuleHtml(rn, rules, nodes, true); // make name editable, no on change events and add a submit button, no activate field
	ret+="</tr></table>";
	return ret;
};

