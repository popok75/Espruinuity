


exports.getHeader=function(str){
	switch(str){
		case "header": return "<!DOCTYPE html><html><head> <style> .pure-table { border-collapse: collapse; border-spacing: 0; empty-cells: show; border: 1px solid #cbcbcb } .pure-table caption {color:#888;font:italic 125%/1 Helvetica, sans-serif;padding:.5em 1;text-align: center} .pure-table td, .pure-table th { border-left: 1px solid #cbcbcb; border-width: 0 0 0 1px; font-size: inherit; margin: 0; overflow: visible; padding: .5em 1em } .pure-table td:first-child, .pure-table th:first-child { border-left-width: 0 } .pure-table td { background-color: transparent } .pure-table-odd td, .pure-table-striped tr:nth-child(2n-1) td { background-color: #f2f2f2 } .pure-table-bordered td { border-bottom: 1px solid #cbcbcb } .pure-table-bordered tbody>tr:last-child>td { border-bottom-width: 0 } h1 { font-size: 1.75em; margin: .67em 0; } body { font-family: FreeSans, Arimo, 'Droid Sans', Helvetica, Arial, sans-serif; } </style> <meta name='viewport' content='width=device-width, initial-scale=1.0'><link rel='icon' href='https://d30y9cdsu7xlg0.cloudfront.net/png/911936-200.png' sizes='32x32'> ";break;
	}
};

exports.getPre=function(str){
	switch(str){
		case "preinput":  return  "<table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Inputs</caption> <tr> <th >Input</th> <th >Value</th> </tr> </thead> <tbody>";break;
		case "preoutput":  return "<br><table class='pure-table pure-table-bordered pure-table-striped'> <thead> <caption>Outputs</caption><tr> <th >Output</th> <th >Value</th> </tr> </thead><tbody>";break;
		case "prerule":  return "<table class='pure-table pure-table-bordered pure-table-striped'> <thead><caption>Rules</caption> <tr> <th>Active</th><th >Name</th><th >Condition</th> <th>Action</th> </tr> </thead><tbody>";break;
	}
};

exports.loadDoc = function() {
	   function resa(){this.buffer="";this.write=function(str){this.buffer+=str;};};
	   var nodes=document.getElementById('nodes').textContent;
	   var rules=document.getElementById('rules').textContent;
	   nodes=nodes.replace("\\\\xB0","&#176;");
	   var r=new resa();
	   t=writeTable("input",{},10000,r,nodes);
	   document.getElementById('data').innerHTML+="input ok";
	   console.log(t);
	   t=writeTable("output",{},10000,r,nodes);
	   document.getElementById('data').innerHTML+="output ok";
	   console.log(t);
	   t=writeTable("rule",{},10000,r,rules,nodes);   
	   document.getElementById('data').innerHTML+="rule ok";
	   console.log(t);			   
	   document.getElementById('data').innerHTML=r.buffer;
	};

/////////////////////////////////////////////////////
	exports.getRuleHtml= function(rule,nodes){
//		print("getRuleHtml");
		//var js=JSON.stringify;

//		print("getRuleHtml0-"+JSON.stringify(process.memory()));


		
		
		function getROpt(varn,tab,cv,rn) { // check memory use here
			var r="<select name="+varn+"  onChange='this.form.submit();' form='"+rn+"'>";
			//	print("inside tab:"+tab);
			for(var i=0;i<tab.length;i++){
				var e=tab[i];
				var sy="symb";
				if(e[sy]===undefined) sy="name";
				r+="<option value='"+e.name+"' ";
				if(e.name==cv) r+="selected ";
				//print("e.name:",e.name,", cv:",cv);
				r+=">"+e[sy]+"</option>";	
			}	
			return r+"</select>";
		};
		
		
		
		
		
//		print("getRuleHtml0.5-"+JSON.stringify(process.memory()));
		var rn=rule.name;
		var ar = "<input name='active' value='"+rule.active+"' type='hidden' form='"+rn+"' /><input type='checkbox' onChange='this.form.active.value=1-this.form.active.value;this.form.submit();' form='"+rn+"'";
	    if (rule.active == "1") ar += " checked";
	    ar += ">";
	    console.log("rule.active ", rule.active);
	    var ret = "<tr><form method='get' id='"+rn+"'><input type='hidden' name='rule' form='"+rn+"' value=" + rn + "><td style='text-align:center'>" + ar + "</td ><td >" + rn + ": </td><td >";
	    var ndsin=[];	// should be executed once per html page
		var ndsout=[];
		nodes=jp(nodes);
		for(var i=0;i<nodes.length;i++){
			var e=jp(nodes[i]);
			if(e.type==="input") ndsin.push({name:e.name}); 
			else if (e.type==="output") ndsout.push({name:e.name});	
		}
		nodes=undefined;

		if(rule.ctype=="timer") {
			console.log("TIMER:");
			//ret+=getROpt("cvar",ndsin ,rule.cvar,rn);
			ret+="A1, wait :";
			ret+="<input type='text' name='t1' value="+rule.t1+" size=1 style='width: 2em' form='"+rn+"'>&nbsp;";
			ret+="sec, A2. cycle :";
			ret+="<input name='cyc' value='"+rule.cyc+"' type='hidden' form='"+rn+"' /><input type='checkbox' onChange='this.form.cyc.value=1-this.form.cyc.value;this.form.submit();' form='"+rn+"'";
			if(rule.cyc=="1") ret+="checked><input type='text' name='t2' value="+rule.t2+" size=1 style='width: 2em' form='"+rn+"'>&nbsp;";
			else ret+=">";
			var comp=[{name:"0",symb:"Off"},{name:"1",symb:"On"}];
			ret+="</td><td> A1:"+getROpt("actvar1",ndsout, rule.actvar1,rn);
			ret+=getROpt("actval1",comp,rule.actval1,rn);
			ret+=" , A2:"+getROpt("actvar2",ndsout, rule.actvar1,rn);
			ret+=getROpt("actval2",comp,rule.actval1,rn);
			ret+="</td></tr></form>";
			return ret;
		}
		ret+="if "+getROpt("cvar",ndsin ,rule.cvar,rn);
		ndsin=undefined;
		var comp=[{name:"less",symb:"&#60;"},{name:"greaterorequal",symb:"&#8805;"}];
		ret+=getROpt("ccomp",comp,rule.ccomp,rn);
		ret+="<input type='text' name='cval' value="+rule.cval+" size=1 style='width: 2em' form='"+rn+"'>&nbsp;";


		ret+="</td><td >then ";
		ret+=getROpt("actvar",ndsout, rule.actvar,rn); // check memory use here => get too big 400 blocks why is that ?
		ndsout=undefined;
//		print("getRuleHtml1-"+JSON.stringify(process.memory()));
		comp=[{name:"0",symb:"Off"},{name:"1",symb:"On"}];
		ret+=getROpt("actval",comp,rule.actval,rn);
//		print("rule actval:"+rule.actval, getROpt("actval",comp,"symb") );
		ret+="</td></tr></form>";

//		print("rule html length:"+ret.length);
//		print("getRuleHtml-"+JSON.stringify(process.memory()));
//		print("getRuleHtml:ret length",ret.length);
//		print("getRuleHtml:ret size",E.getSizeOf(ret));
//		print("getRuleHtml:nsin size",E.getSizeOf(ndsin));
//		print("getRuleHtml:nsout size",E.getSizeOf(ndsout));
//		print("getRuleHtml2-"+JSON.stringify(process.memory()));

		return ret;
	};


