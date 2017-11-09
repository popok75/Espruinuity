

var jp=JSON.parse;
/*
exports.writeHeader=function(i,s, res){
	var v=(r("IOServerStrings"))("header");
	// write s bytes of header starting at index i
	//print("v:",v);
	var sub=v.substring(i,i+s);
	res.write(sub);
	return sub.length;
	// return bytes written

};
*/


exports.writeTable=function(type,t,max, res, nodes, nnodes){

//	print("writeTable 0 -"+JSON.stringify(process.memory()));
	
	function getSized(nh,mx, tr) {
		var itbi=tr.lastitembytes;

		if((nh.length-itbi)>mx) {
			//item too long will surely cut it
			nh=nh.substring(itbi,itbi+mx);
			tr.lastitembytes=itbi+mx;	
			tr.status="continue";
		}
		else { //item not too long will probably loop, unless item has right size
			if(itbi>0) nh=nh.substring(itbi);
			tr.lastitembytes=0;
			tr.lastitem=tr.lastitem+1;
			tr.status="next";
		}
		
		return nh;
	}

	var post="</tbody> </table>";

	var written=0;	
	var towrite="";	
	

	
	if(t.operation===undefined) {t.operation="header";t.lastitem=0, t.lastitembytes=0;t.written=0;}
//	print("writeTable 2.2 -"+JSON.stringify(process.memory()));
	
	if(t.operation=="header") {
		var nh;
		if(r==="") nh=getSized(getPre("pre"+type),max, t);//on browser
		else nh=getSized(r("IOServerStrings").getPre("pre"+type),max, t); //on espruino
		towrite+=nh;
		max-=nh.length;
		written+=nh.length;

		if(t.status==="next") {t.operation="data";t.lastitem=0, t.lastitembytes=0;}
	}

	var s=max; 
	var ns= jp(nodes);
	
	if(t.operation=="data") 
		for (var i = t.lastitem; i <ns.length && written<s; i++) {
			var e=jp(ns[i]);
			//	print("type:",e.type,type);
			//	print("elem",e);
//			print("writeTable 4 -"+JSON.stringify(process.memory()));

			if(e.type==type) {
				var nh="";

				if (e.type=="rule") {
					if(r==="") nh+=getRuleHtml(e,nodes,nnodes);
					else nh+=r("WifiSync").getRuleHtml(e,nodes,nnodes);
				}
				else nh+=getNodeHtml(e);
				t.lastitem=i;									

				var nh2=getSized(nh,max,t);
				max-=nh2.length;
				written+=nh2.length;
				towrite+=nh2;

			}
			//	print("NodeHtml:",i,ns.length);
		}
	
//	print("writeTable 8 -"+JSON.stringify(process.memory()));
	if(t.operation=="data" && t.status=="next" && written<s) {t.operation="footer";t.lastitem=0, t.lastitembytes=0;}
//	print("writeTable 9 -"+JSON.stringify(process.memory()));
	if(t.operation=="footer") {
		//	print("footer ",post,max,tracker)
		var nh=getSized(post,max, t);
		towrite+=nh;
		max-=nh.length;
//		written+=nh.length;
//		print ("towrite3 :",towrite.length,nh.length,s,max);
		if(t.status==="next") t.operation="finished";
	}
//	print("writeTable 10 -"+JSON.stringify(process.memory()));


	print("sent html:"+towrite.length);
	res.write(towrite);
	t.written=towrite.length;
//	print("writeTable end -"+JSON.stringify(process.memory()));
	/*	print("size to write :"+JSON.stringify(E.getSizeOf(towrite)) );
	print("size tracker :"+JSON.stringify(E.getSizeOf(tracker)) );
	print("size ns :"+JSON.stringify(E.getSizeOf(ns)) );
	 */	
	return t;
};




///////////////////////////

exports.getNodeHtml = function(e){
	const  linestart = "<tr>";
//	const  namestart="<td class='pure-table td'>";
	const  namestart="<td>";
	const  nameend="</td>";
//	const  valuestart="<td class='pure-table td' style='text-align: center'>";
	const  valuestart="<td style='text-align: center'>";
	const  valueend= "</td>";
	const  lineend="</tr>";

	function getForm(e){
		var r="<input type='radio' name='val' value='1'";
		var r2="> On <input type='radio' name='val' value='0' ";
		if(e.val==0) {r+="onChange='this.form.submit();'";r2+="checked";}else {r2+="onChange='this.form.submit();'";r+="checked";}		
		r2+="> Off";	

		return r+r2;	
	};

//	var docend="</tbody> </table></body></html>";
//	console.log("getInput::this: "+JSON.stringify(this));
//	console.log("getInput::this.inputs: "+JSON.stringify(this.inputs));
	var ret="";
	ret+=linestart;
	ret+=namestart;
	ret+=e.name;
	ret+=nameend;
	ret+=valuestart;
	if(e.type==="output") {ret+="<form method='get' id='output'><input type='hidden' name='node' value="+e.name+">"+getForm(e)+"</form>";
	}else {ret+=e.val;ret+=e.unit;}
	ret+=valueend;
	ret+=lineend;
	return ret;
};

exports.loadDoc = function() {
	function resa(){this.buffer="";this.write=function(str){this.buffer+=str;};};
	nodes=document.getElementById('nodes').textContent;
	rules=document.getElementById('rules').textContent;
	nodes=nodes.replace("\\\\xB0","&#176;");
	var r=new resa();
	var t=writeTable("input",{},10000,r,nodes);
//	console.log(t);
	t=writeTable("output",{},10000,r,nodes);
//	console.log(t);
	t=writeTable("rule",{},10000,r,rules,nodes);   
//	console.log(t);	
	r.buffer+=addRule( rules, nodes);
	document.getElementById('data').innerHTML=r.buffer;
};

var getNodeHtml=exports.getNodeHtml;
//var getRuleHtml=exports.getRuleHtml;











