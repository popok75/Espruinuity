/**
 Copyright 2014,2015 Juergen Marsch (juergenmarsch@googlemail.com)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Local Project handling Plugin
 ------------------------------------------------------------------
 *
 *  Modified by Me.
 **/

"use strict";
(function(){
	var iconFolder,iconSnippet,actualProject = "";
	var snippets = JSON.parse('{ "Reset":"reset();","Memory":"process.memory();","ClearInterval":"clearInterval();"}');
	var minified=Object();
	var flashLoadedVar=false;

	function init() {

		Espruino.Core.Config.addSection("FlashView", {
			sortOrder:500,
			description: "Local directory used for modules, files, binaries. When you select a directory, the 'FlashView' icon will appear.",
//			tours: { "Project Tour":"project.json", "Snippets Tour":"projectSnippet.json" },
			getHTML : function(callback) {
				var html =
					'<div id="flashViewFolder" style="width:100%;border:1px solid #BBB;margin-bottom:10px;"></div>'+
					'<button class="flashViewButton">Select Directory for Files</button>';
				callback(html);
				setTimeout(function(){
					showLocalFolder();
					setSandboxButton(); // make the 'Select Directory' button do something
				},10);
			}
		});

		showIcon(Espruino.Config.flashViewEntry);
	}



	/////////////////// POPUP window

	function getFlashView(html,callback){
		if(Espruino.Config.flashViewEntry){
			html += '<div id="tabs">';
			html += '<ul><li><a href="#r">Memory</a></li>';
			html += '<li><a href="#f">Flash</a></li>';
			html += '<li><a href="#m">Modules</a></li>';
			html += '<li><a href="#b">Binaries</a></li></ul>';
			getFlash(html,function(html) {
				getMemory(html,function(html) {
					getModules(html,function(html){
						getBinaries(html,function(html){
							html += '</div>';
							callback(html);
						});
					});
				});
			});

		}
		else{
			html += 'Files folder not assigned<br>Open options and click set folder';
			callback(html);
		}
	}

	//////////////////////////////////// MODULES

	function getModules(html,callback){

		getProjectSubDir("modules",function(dir){
			chrome.fileSystem.getDisplayPath(dir, function(path) {
				console.log("writing modules");
				var header,row,footer;
				header = '<div id="m"><table width="100%" ><caption>Folder : '+path+'</caption>';
				header+= '<tr><td></td><td></td><td></td><td></td><td style="text-align:center"><button title="send FlashString loader" class="uploadLoader" ';
				if(!Espruino.Core.Serial.isConnected()) header+='style="display:none;" ';
				header+= '></button></td><td></td></tr>';
				var st='style="color:#808080"';
				var st2='style="color:#808080;text-align:center"';
				if(!Espruino.Core.Serial.isConnected()) {
					header+= '<tr><td '+st+' > </td><td>bytes</td><td></td><td '+st2+'></td><td  '+st2+'></td><td  +'+st2+'></td></tr>';

				}else header+= '<tr><td '+st+' >transfer to </td><td>bytes</td><td></td><td '+st2+'>memory</td><td  '+st2+'>flash</td><td  +'+st2+'></td></tr>';


				//	header+= '<tr><td '+st+' >transfer to </td><td>bytes</td><td></td><td '+st2+'>memory</td><td  '+st2+'>flash</td><td  +'+st2+'></td></tr>';
				row = '<tr><th>$name</th><td>$size0</td><td title="minified" style="text-align:center;color:#808080;">$minified</td>';
				row += '<td style="text-align:center"><button title="upload to Memory" class="uploadToMemory" fileentry="$fileentry" ';
				if(!Espruino.Core.Serial.isConnected()) row+='style="display:none;" ';
				row += 'filename="$name"></button></td>'
					row += '<td style="text-align:center"><button title="upload to Flash" class="uploadToFlash" fileentry="$fileentry" ';
				if(!Espruino.Core.Serial.isConnected()) row+='style="display:none;" ';
				row += 'filename="$name"></button></td>'
					row += '<td>';
				//row+='<button title="copy to SD" class="copyModule" fileentry="$fileentry" filename="$name"></button>'
				row+='</td>';

				row += '</tr>';
				footer = '</table></div>';
				getProjectTable(html,"modules","JS",header,row,footer,callback);


			});


		});

	}

	function getFlash(html,callback){

//		var header,row,footer;
		//  header = '<div id="f"><table width="100%">';


		getFlashState();



		var header,row,footer;
		header = '<div id="f"><table width="100%">';
		if(Espruino.Core.Serial.isConnected()) header+= '<tr><td><td><td></td><td></td><td style="text-align:center"><button title="send FlashString loader" class="uploadLoader" ></button></td></tr><tr><td>FlashString not loaded</td></tr>';
		else  header+='<tr><td>Flash not connected</td></tr>';
		footer = '</table></div>';
		callback(html+header+footer);

	}

	function getMemory(html,callback){

//		var header,row,footer;
		//  header = '<div id="f"><table width="100%">';


		getMemoryState();



		var header,row,footer;
		header = '<div id="r"><table width="100%"><tr><td>Espruino not connected</td></tr>';
		footer = '</table></div>';
		callback(html+header+footer);

	}

	function copyModule(){  console.log($(this));
	var fileName = $(this).attr("filename");
	checkEntry($(this).attr("fileentry"),function(theEntry){
		readFilefromEntry(theEntry,function(data){
			copy2SD("node_modules/" + fileName,data);
		});
	});
	}

	function uploadToFlash(){  

		//	console.log($(this));
		var fileName = $(this).attr("filename");

		checkEntry($(this).attr("fileentry"),function(theEntry){
			readFilefromEntry(theEntry,function(data){
				upload2Flash(fileName,data);
			});
		});
	}

	// TODO
	function uploadFileToFlash(){  
		var path = $(this).attr("filename");
		var ext = path.split(".");
		ext=ext[[ext.length-1]];
		console.log("ext:"+ext);
		if(ext=="txt") {
			checkEntry($(this).attr("fileentry"),function(theEntry){
				readFilefromEntry(theEntry,function(data){
					fileToFlash(path,data);
				});
			});
		}
		else {
			readBinaryArrayfromEntry($(this).attr("fileentry"),function(data){
				var u = new Uint8Array(data);
				fileToFlash(path,u);
			});
			
		}
		
				
			 
		 
	}

	function fileToFlash(path,data) { 
//\u0010;
				var src="\u0010;require('FlashString').save('"+path+"',"+JSON.stringify(data)+");\n";

				console.log("src:"+src);
				console.log("character : '"+data.charCodeAt(data.length-1)+"'");
				// console.log("jsonified:->"+JSON.stringify(src));
				// console.log("jsonified 2 :->"+JSON.stringify(data));
				Espruino.Core.Serial.write(src);
				Espruino.Core.App.closePopup();
				$("#terminalfocus").focus();}

	function uploadLoader(){  

		var fileName= "FlashString.js";
		getProjectSubDir("modules",function(e){
			e.getFile(fileName,{create:true},function(fileEntry){
				readFilefromEntry(fileEntry,function(data){
					uploadModule2Memory(fileName.substring(0,fileName.lastIndexOf(".")),data);
				});
			});
		});
	}



	function loadModuleMemory(){  
		var fileName = $(this).attr("filename");
		//fileName=fileName.substring(0,fileName.indexOf("."));

		loadModuleFromFlash(fileName);
	}

	function loadModuleFromFlash(path){
		var name=path.substring(0,path.indexOf("."));
		if(Espruino.Core.Serial.isConnected()){
			//\u0010;
			//	console.log("path:"+path);
			var src='if(Modules.getCached().indexOf("'+name+'")>-1) Modules.removeCached("'+name+'");Modules.addCached("'+name+'",require("FlashString").load("'+path+'"));\nprocess.memory();\nE.getSizeOf(global["\u00ff"].modules,1);\n'; //E.getSizeOf(global["\u00ff"].modules,2)
			Espruino.Core.Serial.write(src);

		}else{
			Espruino.Core.Notifications.error("Espruino Not Connected");
		}
		getMemoryState();
	}


////////////////////////Memory part



	function getMemoryState(){
		//	console.log("getMemoryState");
		if(Espruino.Core.Serial.isConnected()){
			var mod="MODULES:";
			var tag="MEMORY:";

			var msg="\u0010;print('"+mod+"'+JSON.stringify(E.getSizeOf(global['\u00ff'].modules,1)));";
			msg+= "print('"+tag+"'+JSON.stringify(process.memory()));\n";
			var receivedData = "";
			var prevReader;
			var listener=function (readData) {				
				listener.prev=function(p,n){
					//				console.log("getMemoryState::prevf "+prevReader.toString().substring(0,50));
					if(prevReader==p) {
						prevReader=n;
						//					console.log("getMemoryState::prevReader changed to "+prevReader.toString().substring(0,50));						
					}
					else if(prevReader!== undefined && prevReader.hasOwnProperty("prev")) {
						prevReader.prev(p,n);
					}
				};



				//			console.log("getMemoryState::mempassing0 :"+JSON.stringify(readData));
				var bufView = new Uint8Array(readData);
				var ndata="";
				for(var i = 0; i < bufView.length; i++) {
					ndata += String.fromCharCode(bufView[i]);
				}
				receivedData+=ndata;

				if (receivedData.indexOf(tag+"{")>-1 && receivedData[receivedData.length-1] == ">") {   
					console.log("getMemoryState: got data "+receivedData);

					var i=receivedData.indexOf(tag+"{");
					var mem= receivedData.substring(i+tag.length, receivedData.indexOf("\r\n",i+tag.length) );

					i=receivedData.indexOf(mod+"[");
					var mods;
					if(i>-1) {
						mods= receivedData.substring(i+mod.length, receivedData.indexOf("\r\n",i+mod.length) );
					} else {
						i=receivedData.indexOf(mod+"0");
						if(i>-1) console.log ("problem !");
						mods= "[]";
					}
					var data=receivedData;

					var text=showMemHtml(JSON.parse(mods),JSON.parse(mem));					  
					// $("#f").html(showMemHtml(array));
					$("#r").html(text);
					setTimeout(function(){
						$(".eraseMem").button({ text:false, icons: { primary: "ui-icon-trash"} }).click(eraseMemory);
						$(".updateMemory").button({ text:false, icons: { primary: "ui-icon-arrowrefresh-1-n"} }).click(updateToMemory);

					},50);

					var curr=Espruino.Core.Serial.startListening("");
					Espruino.Core.Serial.startListening(curr);
					if(listener!= curr ) {				 	
						if(curr.hasOwnProperty("prev")) {
							curr.prev(listener,prevReader);};
					} else Espruino.Core.Serial.startListening(prevReader);		        
				}
				if(prevReader) prevReader(readData);
			};
			/// TODO : dont listen twice even if repressed, dont keep it forever and say something
			prevReader = Espruino.Core.Serial.startListening(listener);
			//		console.log("getMemoryState::prev0.1 "+prevReader.toString().substring(0,50));

			Espruino.Core.Serial.write(msg+"\n");

		}else{
			Espruino.Core.Notifications.error("Espruino Not Connected");
		}

	}


	function showMemHtml(arr,mem) {

		var header,row="",footer;
		header = '<div id="r" style="text-align:center"><table width="100%"><caption>Modules in Memory</caption><tr><th style="color:#808080">name</th><th style="color:#808080;">blocks</th><th style="color:#808080;">update</th><th style="color:#808080;">erase</th></tr>';
		var i=1;
		var free=-1;
		var tsize=0;
		arr.forEach(function(e){
			//	console.log("E:"+JSON.stringify(e));

			//	console.log("before");
			if(e.hasOwnProperty("name")) {
				row += '<tr><td style="text-align:left">'+(i++)+') '+e.name+'</td><td>'+e.size+'</td><td>';

				//checkFileExists("modules",(e.name+".js"),function(){print("file found:"+)},function(){});

				/*			setTimeout(function(){				
				var q=".updateMem";//
				q="[fileentry='"+e.name+"']";
				console.log("q:"+q);

				console.log("obj:"+JSON.stringify($(q).button().parent().html()));
				console.log("obj:"+JSON.stringify($(q).button().parent().val()));

				},50);*/

				//	$("[fileentry='"+e.name+"']").forEach(function (en){console.log("en:"+JSON.stringify(en));});

				var q=".updateMemory[filename='"+e.name+"']";
				getProjectSubDir("modules",function(subDirEntry){
					if (!subDirEntry) return;
					checkFileExists(subDirEntry,(e.name+".js"),
							function(fileEntry){
						setTimeout(function(){$(q).button().attr("fileentry",chrome.fileSystem.retainEntry(fileEntry));});
						//		console.log("file found:"+fileEntry.name);
					},
					function(){
						//	console.log("file not found:"+(e.name+".js"));
						setTimeout(function(){
							//	console.log("bef:"+JSON.stringify($(q).button().parent().html()));
							$(q).button().hide();
							//	console.log("aft:"+JSON.stringify($(q).button().parent().html()));

						},50);
					}
					);
				});
				//	console.log("after");


				row +='<button title="Update item from file" class="updateMemory" filename="'+e.name+'" fileentry="$fileentry"></button>';
				row +='</td><td><button  title="Erase item from Memory" class="eraseMem" filename="'+e.name+'"></button></td>';
				tsize+=parseInt(e.size);
			} else free=e.free;
			row += '</tr>\n';

		});
		row += '<tr></tr><tr><td style="text-align:left">All : '+(i-1)+' </td><td>'+tsize+'</td><td></td><td>';
		if(tsize>0)row+='<button title="Erase item from Memory" class="eraseMem" filename="all"></button>';
		row+='</td></tr>';;

		footer = '</table>   <caption><small style="color:#808080;text-align:center">';
		var mfooter="";
		for (var property in mem) {
			if (mem.hasOwnProperty(property)) {
				mfooter+=property+":"+mem[property]+", ";
			}
		}
		if(mfooter.length>2) footer+="("+mfooter.substring(0,mfooter.length-2)+")";

		footer+='</caption>  </small></div>';
		return header+row+footer;

	}





//////////////////////Buttons

	function eraseMemory(){
		var fileName = $(this).attr("filename");
		console.log("Erase from memory :"+fileName);
		if(fileName=="all") {
			Espruino.Core.Serial.write("Modules.removeAllCached();\n");
			getMemoryState();
		} else{
			Espruino.Core.Serial.write("Modules.removeCached('"+fileName+"');\n");
			getMemoryState();
		}
	}




	function updateToMemory(){  
		var a=$(this).attr("filename");
		$(this).attr("filename", a+".js");
//		console.log("Upload to Memory 0 : "+a);

		console.log("Upload to Memory 0.1 : "+$(this).attr("filename"));
		uploadToMemory.bind($(this))();

	}

	function uploadToMemory(){  
		// $("#m").html("HELLO");
		var fileName = $(this).attr("filename");
//		console.log("Upload to Memory 0.5 : "+fileName);
		fileName=fileName.substring(0,fileName.lastIndexOf("."));
//		console.log("Upload to Memory : "+fileName);

		console.log("filename:"+fileName);
		console.log("fileentry:"+$(this).attr("fileentry"));
		checkEntry($(this).attr("fileentry"),function(theEntry){
			readFilefromEntry(theEntry,function(data){
				uploadModule2Memory(fileName,data);
			});
		});
	}


/////////////////////////////////////////////// uploadModule2Memory

	function uploadModule2Memory(path,idata){
		//	console.log("data:"+data);
		if(Espruino.Core.Serial.isConnected()){

			Espruino.callProcessor("transformModuleForEspruino", idata, function(data) {
				minified[path+".js"]={"full":idata.length,"mini":data.length};
				//	console.log("minified 2 "+JSON.stringify(minified));
				//Espruino.callProcessor("sending");
				data=Espruino.Core.CodeWriter.reformatCode(data);
				data=data.replace(new RegExp("\u0010", 'g'), "");

				if (Espruino.Config.MODULE_AS_FUNCTION)
					data="function(){"+data+"}";
				else data=JSON.stringify(data);

				//data=JSON.stringify(data);
				if(data.charCodeAt(data.length-1)==59) data=data.substring(0,data.length-1);
				//			console.log("data 2 :"+data);

				//			console.log("character : '"+data.charCodeAt(data.length-1)+"'");
				//			console.log("character 0 : '"+data.charCodeAt(0)+"'");


				var src='\u0010;if(Modules.getCached().indexOf("'+path+'")>-1) Modules.removeCached("'+path+'");Modules.addCached("'+path+'",'+data+');\nprocess.memory();\nE.getSizeOf(global["\u00ff"].modules,1);\n'; //E.getSizeOf(global["\u00ff"].modules,2)
				console.log("src:"+src);
				// Espruino.Core.Serial.startListening(function(data) {console.log("RETURN DATA:"+arrayBufferToString(data)); });

				/*  var  receivedData = "";
			  var prevReader = Espruino.Core.Serial.startListening(function (readData) {
			      var bufView = new Uint8Array(readData);
			      for(var i = 0; i < bufView.length; i++) {
			        receivedData += String.fromCharCode(bufView[i]);
			      }
			      if (receivedData[receivedData.length-1] == ">") {
			    	  console.log("RETURN DATA:"+JSON.stringify(receivedData));
			        console.log("Received a prompt after sending newline... good!");
			        if(prevReader) prevReader(receivedData);
			        Espruino.Core.Serial.startListening(prevReader);		        
			      }
			  });*/

				Espruino.Core.Serial.write(src);
				Espruino.Core.App.closePopup();
				$("#terminalfocus").focus();
			});

		}else{
			Espruino.Core.Notifications.error("Not Connected");
		}
	}




















/////////////////////////////////////////////// Flash part

/////////////////////////////////////////////// getFlashState

	function getFlashState(){

		if(Espruino.Core.Serial.isConnected()){

			var tag="Flash:";
			var msg="\u0010;if(Modules.getCached().indexOf('FlashString')>-1) print('"+tag+"'+require('FlashString').list()); else print(\'"+tag+"'+'[]\');";
			var  receivedData = "";
			var prevReader;
			var listener = function (readData) {

				listener.prev=function(p,n){
					if(prevReader==p) prevReader=n;
					else if(prevReader.hasOwnProperty("prev")) {
						prevReader.prev(p,n);
					}
				};

				var bufView = new Uint8Array(readData);
				var ndata="";
				for(var i = 0; i < bufView.length; i++) {
					ndata += String.fromCharCode(bufView[i]);
				}
				receivedData+=ndata;

				if (receivedData.indexOf(tag+"[")>-1 && receivedData[receivedData.length-1] == ">") {   


					var i=receivedData.indexOf(tag+"[");
					var fla;
					if(i>-1) {
						fla= receivedData.substring(i+tag.length, receivedData.indexOf("\r\n",i+tag.length) );
					} else {
						i=receivedData.indexOf(mod+"0");
						if(i>-1) console.log ("problem !");
						fla= "[]";

					}

					var data=receivedData;

					if(fla.length<=2) {Espruino.Core.Notifications.error("FlashString module not loaded");flashLoaded(false);}
					else {
						var text=showFlashHtml(JSON.parse(fla));					  
						// $("#f").html(showMemHtml(array));
						$("#f").html(text);
						$(".loadModuleMemory").button({ text:false, icons: { primary: "ui-icon-transfer-e-w"} }).click(loadModuleMemory);

						//					console.log("getFlashState::page updated with :"+text);
						flashLoaded(true);
					}



					var curr=Espruino.Core.Serial.startListening("");
					Espruino.Core.Serial.startListening(curr);	


					if(listener!= curr ) { 						
						if(curr.hasOwnProperty("prev")) {
							curr.prev(listener,prevReader);};
					} else Espruino.Core.Serial.startListening(prevReader);	

				}
				if(prevReader) prevReader(readData);
			}
			prevReader = Espruino.Core.Serial.startListening(listener);
			;

			Espruino.Core.Serial.write(msg+"\n");

		}else{
			flashLoaded(false);
			Espruino.Core.Notifications.error("Espruino/Flash Not Connected");
		}



	}

	function flashLoaded (f){
		flashLoadedVar=f;
		if(f) {
			$(".uploadLoader").hide();

		}else {
			console.log('$(".uploadLoader") : '+$(".uploadLoader").html());
			console.log('$(".uploadToFlash") : '+$(".uploadToFlash").html());
			$(".uploadToFlash").hide();



		}


	}


	function showFlashHtml(arr) {

		var header,row="",footer;
		header = '<div id="f" style="text-align:center"><table width="100%"><tr><th style="color:#808080">name</th><th style="color:#808080;">bytes</th><th style="color:#808080;">address</th><th style="color:#808080;">load</th><th style="color:#808080;">erase</th></tr>';
		var i=1;
		var free=-1;
		var tsize=0;
		arr.forEach(function(e){
			console.log("E:"+JSON.stringify(e));

			if(e.hasOwnProperty("name")) {
				row += '<tr><td style="text-align:left">'+(i++)+') '+e.name+'</td><td>'+e.size+'</td><td>'+e.address+'</td>';
				row+='<td>';
				if(e.name.includes(".js"))	row+='<button  title="Link as native module in Memory" class="loadModuleMemory" filename="'+e.name+'"></button>';
				row+='</td>';
				row += '<td><button  title="Erase item" class="eraseFlash" filename="'+e.name+'"></button></td>'
				tsize+=parseInt(e.size);
			} else free=e.free;
			row += '</tr>\n';

		});
		row += '<tr></tr><tr><td style="text-align:left">All : '+(i-1)+' </td><td>'+tsize+'</td><td></td><td></td><td><button title="Erase all" class="eraseFlash" fileentry="all"></button></td></tr>';

		footer = '</table>   <caption><small style="color:#808080;text-align:center">('+free+' free pages left) </caption>  </small></div>';
		setTimeout(function(){
			$(".eraseFlash").button({ text:false, icons: { primary: "ui-icon-trash"} }).click(eraseFlash);
		},50);
		return header+row+footer;

	}


	function eraseFlash(){
		var fileName = $(this).attr("filename");
		console.log("Erase:"+fileName);
		if(fileName=="all") {
			Espruino.Core.Serial.write("require('FlashString').eraseAll();\n");
			getFlashState();
		} else{
			Espruino.Core.Serial.write("require('FlashString').erase('"+fileName+"');\n");
			getFlashState();
		}
	}







	function upload2Flash(path,idata){
		//	console.log("data:"+data);
		var src;
		if(Espruino.Core.Serial.isConnected()){

		//	src='echo(1);\n;require("fs").writeFile("'+path+'","'+idata+'");\n;echo(1);\n;';

			Espruino.callProcessor("transformModuleForEspruino", idata, function(data) {
				minified[path+".js"]={"full":idata.length,"mini":data.length};
				data=data.replace(new RegExp(String.fromCharCode(10), 'g'), "");

				data=JSON.stringify(data);
				
				console.log("data last :"+data.charCodeAt(data.length-2),data.charCodeAt(data.length-1));
				console.log("data size :"+data.length);
				// \u0010;
				src="\u0010;require('FlashString').save('"+path+"',"+data+");\n";

				console.log("src:"+src);
				console.log("character : '"+data.charCodeAt(data.length-1)+"'");
				// console.log("jsonified:->"+JSON.stringify(src));
				// console.log("jsonified 2 :->"+JSON.stringify(data));
				Espruino.Core.Serial.write(src);
				Espruino.Core.App.closePopup();
				$("#terminalfocus").focus();
			});

		}
		else{
			Espruino.Core.Notifications.error("Not Connected");
		}
	}











////////////////////////////////////OTHER part










//	TODO: working here
	function getBinaries(html,callback){
		getProjectSubDir("binary",function(dir){
			chrome.fileSystem.getDisplayPath(dir, function(path) {

				var header,row,footer;
				header = '<div id="b"><table width="100%"><caption>Folder : '+path+'</caption>';
				header+= '<tr><td></td><td></td><td></td><td></td><td style="text-align:center"><button title="send FlashString loader" class="uploadLoader"';
				if(!Espruino.Core.Serial.isConnected()) header+='style="display:none;" ';		
				header+= '></button></td><td></td></tr>';
				if(!Espruino.Core.Serial.isConnected()) header+= '<tr><td  style="color:#808080"></td><td>bytes</td><td></td><td style="color:#808080;text-align:center"></td><td  style="color:#808080;text-align:center"></td><td  style="color:#808080;text-align:center"></td></tr>';
				else header+= '<tr><td  style="color:#808080">transfer to </td><td>bytes</td><td></td><td  style="color:#808080;text-align:center">flash</td><td  style="color:#808080;text-align:center"></td></tr>';
				row = '<tr><th>$name</th><td>$size0</td>';
				row += '<td></td><td style="text-align:center"><button title="upload to Flash" class="uploadFileToFlash" fileentry="$fileentry" ';
				if(!Espruino.Core.Serial.isConnected()) row+='style="display:none;" ';
				row += ' filename="$name"></button></th></tr>';
				footer = '';
				getProjectTable(html,"binary","*",header,row,footer,callback);

			});
		});
	}
	function copyBinary(){
		var fileName = $(this).attr("filename");
		checkEntry($(this).attr("fileentry"),function(theEntry){
			readBinaryArrayfromEntry(theEntry,function(data){
				var u = new Uint8Array(data);
				copy2SD("node_binaries/" + fileName,u);
			});
		});
	}
	function copyImage(){
		var fileName = $(this).attr("filename");
		checkEntry($(this).attr("fileentry"),function(theEntry){
			readBinaryArrayfromEntry(theEntry,function(data){
				var u = new Uint8Array(data);
				copy2SD("images/" + fileName,u);
			});
		});
	}
	function getProjects(html,callback){
		getProjectSubDir("projects",function(subDirEntry){
			var name,dirReader = subDirEntry.createReader();
			dirReader.readEntries(function(results){
				var attrFileEntry;
				html += '<div id="p">';
				html += '<table width="100%">';
				for(var i = 0; i < results.length; i++){
					if(!results[i].isDirectory){
						name = results[i].name.split(".");
						if(name[1] === "js"){
							attrFileEntry = 'fileEntry="' + chrome.fileSystem.retainEntry(results[i]) + '"';
							html += '<tr><th>' + name[0] + '</th>';
							if(actualProject){
								if(actualProject.name === results[i].name){
									html += '<th>&nbsp;</th><th title="save Project"><button class="saveProject"></button>';
								}
								else{ html += '<th title="load into Editor"><button class="loadProjects"' + attrFileEntry + '></button>'; }
							}
							else{ html += '<th title="load into Editor"><button class="loadProjects"' + attrFileEntry + '></button>'; }
							html += '</th></tr>';
						}
					}
				}
				html += '</table>';
				html += '<input type="text" value="newProject.js" id="saveAsName"/> <button class="saveAsProject">Save as</button>';
				html += '</div>';
				callback(html);
			});
		});
	}
	function projectSave(){
		actualProject.createWriter(function(fileWriter){
			var bb = new Blob([Espruino.Core.EditorJavaScript.getCode()],{type:'text/plain'});
			fileWriter.truncate(bb.size);
			setTimeout(function(evt){
				fileWriter.seek(0);
				fileWriter.write(bb);
			},200);
		});
		Espruino.Core.App.closePopup();
	}
	function projectSaveAs(){
		getProjectSubDir("projects",function(dirEntry){
			saveFileAs(dirEntry,$("#saveAsName").val(),Espruino.Core.EditorJavaScript.getCode());
			Espruino.Core.App.closePopup();
		});
	}

	function loadProject(){
		checkEntry($(this).attr("fileentry"),openProject);
		function openProject(theEntry){
			actualProject = theEntry;
//			$("#projectName").html(theEntry.name);
			readFilefromEntry(theEntry,copySource);
			function copySource(data){
				Espruino.Core.EditorJavaScript.setCode(data);
			}
		}
		Espruino.Core.App.closePopup();
	}
	function loadModule(localUrl,modulName,callback){
		//localUrl not used in this modul Loading
		getProjectSubDir("modules",getModules);
		function getModules(subDirEntry){
			var fnd = false;
			var dirReader = subDirEntry.createReader();
			dirReader.readEntries(function(results){
				for(var i = 0; i < results.length; i++){
					if(results[i].name === modulName + ".js"){
						fnd = true;
						readFilefromEntry(results[i],callback);
						break;
					}
				}
				if(!fnd){callback(false);}
			});
		}
	}
	function readBinaryArrayfromEntry(entry,callback){
		var reader = new FileReader();
		reader.onload = function(e){callback(e.target.result);};
		entry.file(function(file){ reader.readAsArrayBuffer(file);});
	}
	function loadFirmware(firmwareName,callback){
		getProjectSubDir("firmware",getFirmware);
		function getFirmware(subDirEntry){
			var fnd = false;
			var dirReader = subDirEntry.createReader();
			dirReader.readEntries(function(results){
				for(var i = 0; i < results.length; i++){
					if(results[i].name === firmwareName){
						fnd = true;
						readBinaryArrayfromEntry(results[i],callback);
						break;
					}
				}
				if(!fnd){callback();}
			});
		}
	}
	function loadFile(fileName,callback){
		var adr = fileName.split("/");
		getProjectSubDir(adr[0],getFile);
		function getFile(subDirEntry){
			checkFileExists(subDirEntry,adr[1],fileFound,fileNotFound);
		}
		function fileFound(theEntry){
			readFilefromEntry(theEntry,callback);
		}
		function fileNotFound(){
			Espruino.Core.Notifications.error("File '" + fileName + "' not found");
		}
	}
	function loadDataUrl(fileName,callback){
		var adr = fileName.split("/");
		getProjectSubDir(adr[0],getFile);
		function getFile(subDirEntry){
			checkFileExists(subDirEntry,adr[1],fileFound,fileNotFound);
		}
		function fileFound(theEntry){
			readDataUrlfromEntry(theEntry,callback);
		}
		function fileNotFound(){
			Espruino.Core.Notifications.error("File '" + fileName + "' not found");
		}
	}
	function saveFile(fileName,data){
		var adr = fileName.split("/");
		getProjectSubDir(adr[0],gotDir);
		function gotDir(subDirEntry){
			if(!subDirEntry){ Espruino.Core.Notifications.error("Project directory '" + adr[0] + "' is missing");}
			else{saveFileAs(subDirEntry,adr[1],data);}
		}
	}
	function loadDir(subDir,callback){
		getProjectSubDir(subDir,gotSubDir);
		function gotSubDir(subDirEntry){
			var dirReader = subDirEntry.createReader();
			dirReader.readEntries(function(results){
				callback(results);
			});
		}
	}
	function showIcon(newValue){

		console.log("SHOWICON:"+JSON.stringify(newValue));
		if (iconFolder!==undefined) iconFolder.remove();
//		if (iconSnippet!==undefined) iconSnippet.remove();
		iconFolder = undefined;
		iconSnippet = undefined;
		if(1){
			iconFolder = Espruino.Core.App.addIcon({
				id: 'openFlashView',icon: 'block',title: 'FlashView',order: 500,
				area: { name: "code",position: "top"},
				click: function(){
					getFlashView("",function(html){
						Espruino.Core.App.openPopup({
							position: "relative",title: "FlashView",id: "flashViewTab",contents: html
						});
						setTimeout(function(){
							// $('#tabs > ul').css('background-color', '#888888').css('color','red');
							$('#tabs > ul').css('background-image', 'url()');		
							$('#tabs > ul').css('background-color', '#ccdfff');
							$('#tabs > ul').css('border-top-color', '#5472a5');
							$('#tabs > ul').css('border-right-color', '#5472a5');
							$('#tabs > ul').css('border-bottom-color', '#5472a5');
							$('#tabs > ul').css('border-left-color', '#5472a5');

							$('#tabs > ul >li >a').css('color', '#5472a5');
							$('#tabs > ul>li ').css('border-top-color', '#5472a5');
							$('#tabs > ul>li ').css('border-right-color', '#5472a5');
							$('#tabs > ul>li ').css('border-bottom-color', '#5472a5');
							$('#tabs > ul>li ').css('border-left-color', '#5472a5');



							//		$(".saveProject").button({ text: false, icons: { primary: "ui-icon-disk" } }).click(projectSave);
							//		$(".saveAsProject").button({ text:false, icons: { primary: "ui-icon-plusthick"} }).click(projectSaveAs);
							$(".copyBinary").button({ text:false, icons: { primary: "ui-icon-copy"} }).click(copyBinary);
							$(".copyImage").button({ text:false, icons:{ primary: "ui-icon-copy"} }).click(copyImage);
							$(".copyModule").button({ text:false, icons: { primary: "ui-icon-copy"} }).click(copyModule);
							$(".uploadToFlash").button({ text:false, icons: { primary: "ui-icon-arrowthickstop-1-n"} }).click(uploadToFlash);
							$(".uploadFileToFlash").button({ text:false, icons: { primary: "ui-icon-arrowthickstop-1-n"} }).click(uploadFileToFlash);
							$(".uploadToMemory").button({ text:false, icons: { primary: "ui-icon-arrowthick-1-n"} }).click(uploadToMemory);

							$(".uploadLoader").button({ text:false, icons: { primary: "ui-icon-arrowthick-2-n-s"} }).click(uploadLoader);
							//						$(".dropSnippet").button({ text:false, icons: {primary: "ui-icon-trash"}}).click(dropSnippet);
							//						$(".addSnippet").button({ text:false, icons: { primary: "ui-icon-plusthick"} }).click(addSnippet);
							$(".loadProjects").button({ text:false, icons: { primary: "ui-icon-script"} }).click(loadProject);
							$("#tabs").tabs();
						},50); 
					}); 
				}
			});
			/*
      iconSnippet = Espruino.Core.App.addIcon({
        id:'terminalSnippets',icon: 'snippets',title: 'Snippets',order: 500,
        area: {name: "terminal",position: "top"},
        click: function(){
          var html = '<ul class="terminalSnippets">';
          for(var i in snippets){
            html += '<li class="terminalSnippet">' + i + '</li>';
          }
          html += '</ul>';
          Espruino.Core.App.openPopup({
            position: "relative",title: "Snippets",id: "snippetPopup",contents: html
          });
          $(".terminalSnippet").click(sendSnippets);
        }
      });*/ 
		}
	}























	function appendFile(fileName,data){
		var adr = fileName.split("/");
		getProjectSubDir(adr[0],gotDir);
		function gotDir(subDirEntry){
			if(!subDirEntry){ Espruino.Core.Notifications.error("Project directory '" + adr[0] + "' is missing");}
			else{
				subDirEntry.getFile(adr[1],{create:true},function(fileEntry){
					fileEntry.createWriter(function(fileWriter){
						var bb = new Blob([data],{type:'text/plain'});
						setTimeout(function(evt){
							if(fileWriter.length === 0) fileWriter.seek(0); else fileWriter.seek(fileWriter.length - 1);
							fileWriter.write(bb);
						},100);
					});
				});
			}
		}
	}
	function copy2SD(path,data){
		console.log("data:"+data);
		var src,i,y;
		if(Espruino.Core.Serial.isConnected()){

			src = 'echo(0);\n;';
			src += 'var fs = require("fs");fs.unlink("' + path + '");';
			Espruino.Core.Serial.write(src);
			for(i = 0; i <= data.length / 256;i++){
				y = new Uint8Array(data.buffer,i * 256,Math.min(data.length - i*256,256));
				if(i === 0){ src = 'fs.writeFile';} else{ src='fs.appendFile';}
				if(typeof data === "string"){
					src += '("' + path + '","' + btoa(y) + '");\n';
				}
				else{
					src += '("' + path + '",atob("' + btoa(String.fromCharCode.apply(null,y)) + '"));\n';
				}
				Espruino.Core.Serial.write(src);
			}
			src = 'echo(1);\n\n';


			Espruino.Core.Serial.write(src);
			Espruino.Core.App.closePopup();
			$("#terminalfocus").focus();


		}
		else{
			Espruino.Core.Notifications.error("Not Connected");
		}
	}

	function getProjectTable(html,subDir,ext,header,row,footer,callback){
		getProjectSubDir(subDir,gotSubDir);
		function gotSubDir(subDirEntry){
			var name,lhtml,lrow,dirReader = subDirEntry.createReader();
			dirReader.readEntries(function(results){
				lhtml = header;		
				var i=0;
				var nf=function (meta){
					//		console.log("inside metadata");
					//for(var i = 0; i < results.length;i++){
					if(!results[i].isDirectory){
						//			console.log("entry :"+results[i].name);
						//				console.log("in entry :"+results[i].name);
						name = results[i].name.split(".");
						var s= meta.size;
						//				console.log("in entry size :"+meta.size);
						//				console.log("in entry name.length :"+name.length);
						if(name.length > 1){
							if(name[1].toUpperCase() === ext || ext=="*"){lrow=row;
							while(lrow.indexOf("$name0")>-1)lrow = lrow.replace("$name0",name[0]);						 
							while(lrow.indexOf("$size0")>-1) lrow = lrow.replace("$size0",s);
							//		 	console.log("minified "+JSON.stringify(minified));
							if(results[i].name in minified){
								//	 		console.log("found in minified "+minified[results[i].name]);
								if(s==minified[results[i].name].full) while(lrow.indexOf("$minified")>-1) lrow = lrow.replace("$minified","("+minified[results[i].name].mini +")");
								else while(lrow.indexOf("$minified")>-1) lrow = lrow.replace("$minified","");

							} else {
								//	 		console.log("not found in minified ", results[i].name, minified[results[i].name]);

								while(lrow.indexOf("$minified")>-1) lrow = lrow.replace("$minified","");
							}

							while(lrow.indexOf("$fileentry")>-1) lrow = lrow.replace("$fileentry",chrome.fileSystem.retainEntry(results[i]));
							while(lrow.indexOf("$name")>-1) lrow = lrow.replace("$name",results[i].name);
							lhtml += lrow;
							}
						}	
					}
					i++;
					if(i<results.length) results[i].getMetadata(nf);
					else {
						lhtml += footer;
						callback(html + lhtml);
					}
					//}
				};

				results[i].getMetadata(nf);

				//		console.log("after calling metadata for file "+chrome.fileSystem.retainEntry(results[i]).getMetadata().size);


			});
		}
	}


	function findBinary(code,callback){ // find it in E.asmBinary(FunctionName,format,asmFunction);
		var binary = {},binarys = [];
		var lex = Espruino.Core.Utils.getLexer(code);
		var tok = lex.next();
		var state = 0;
		var startIndex = -1;
		while (tok!==undefined) {
			if (state==0 && tok.str=="E") { state=1; binary={}; binary.start = tok.startIdx; tok = lex.next();}
			else if (state==1 && tok.str==".") { state=2; tok = lex.next();}
			else if (state==2 && (tok.str=="asmBinary")) { state=3; tok = lex.next();}
			else if (state==3 && (tok.str=="(")) { state=4; tok = lex.next();}
			else if (state==4){ binary.variable = tok.value; state=5; tok = lex.next();}
			else if (state==5 && (tok.str==",")) { state=6; tok = lex.next();}
			else if (state==6){ binary.format = tok.value; state=7; tok = lex.next();}
			else if (state==7 && (tok.str==",")) {state=8; tok = lex.next();}
			else if (state==8 && tok.str){
				state=0;
				binary.binary = tok.value;
				binary.token = code.substring(binary.start,tok.endIdx + 1);
				binarys.push(binary);
			}
			else{
				state = 0;
				tok = lex.next();
			}
		}
		if(binarys.length === 0){ return callback(code);}
		replaceAllBinaries(code,binarys,callback);
	}
	function replaceAllBinaries(code,binarys,callback){
		var i = 0;
		replaceBinary(binarys[i]);
		function replaceBinary(binary){
			Espruino.callProcessor(
					"getBinary",
					{ binary: binary, binaryCode:undefined},
					function(data){
						if(data.binaryCode){
							var asm = "if(!ASM_BASE){ASM_BASE = process.memory().stackEndAddress;}\n";
							asm += "ASM_BASE_" + data.binary.variable + " = ASM_BASE + 1;\n[";
							var bufView=new Uint8Array(data.binaryCode);
							for(var j = 0;j < bufView.length; j+=2){
								asm += "0x" + int2Hex(bufView[j + 1]) + int2Hex(bufView[j]) + ",";
							}
							asm = asm.substr(0,asm.length - 1) + "].forEach(function(v)";
							asm += "{ poke16((ASM_BASE+=2)-2,v); });\n";
							asm += "var " + data.binary.variable  + " = E.nativeCall(ASM_BASE_" + data.binary.variable + ",\"" + data.binary.format + "\")";
							code = code.replace(data.binary.token,asm);
						}
						i++;
						if(i >= binarys.length){ callback(code);}else{replaceBinary(binarys[i]);}
					}
			);
		}
	}
	function int2Hex(u){
		var l = u.toString(16);
		if(l.length === 1){ l = "0" +l; }
		return l;
	}
	function checkSubFolder(entries,subDirName){
		var r = false;
		for(var i = 0; i < entries.length; i++){
			if(entries[i].is){
				if(entries[i].name === subDirName){ r = true;break;}
			}
		}
		return r;
	}
	function updateProjectFolder(theEntry){
		var dirReader = theEntry.createReader();
		var entries = [];
		dirReader.readEntries (function(results) {
			if(!checkSubFolder(results,"binary")){ theEntry.getDirectory("binary", {create:true}); }
			if(!checkSubFolder(results,"firmware")){ theEntry.getDirectory("firmware", {create:true}); }
			if(!checkSubFolder(results,"modules")){ theEntry.getDirectory("modules", {create: true}); }
			if(!checkSubFolder(results,"projects")){ theEntry.getDirectory("projects", {create:true}); }
			//		if(!checkSubFolder(results,"snippets")){ theEntry.getDirectory("snippets", {create:true}); saveSnippets(); }
			if(!checkSubFolder(results,"testing")){ theEntry.getDirectory("testing", {create:true}); }
			if(!checkSubFolder(results,"testinglog")){ theEntry.getDirectory("testinglog", {create: true}); }    });
	} 
	function setSandboxButton(){
		$(".flashViewButton").click(function(evt){
			chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(theEntry) {
				if(theEntry){
					chrome.fileSystem.getDisplayPath(theEntry,function(path) {
						$("#flashViewEntry").val(chrome.fileSystem.retainEntry(theEntry));
						Espruino.Config.set("flashViewEntry",chrome.fileSystem.retainEntry(theEntry));
						showLocalFolder(); // update text box + icon
						updateProjectFolder(theEntry);
					});
				} else {
					// user cancelled
					Espruino.Config.set("flashViewEntry",""); // clear project entry
					showLocalFolder(); // update text box + icon
				}
			});
		});
	}  	



	function showLocalFolder(){
		// set whether we show the project icon or not
		showIcon(Espruino.Config.flashViewEntry);
		// update the project folder text box
		$("#flashViewFolder").html("&nbsp;");
		if(Espruino.Config.flashViewEntry){
			chrome.fileSystem.isRestorable(Espruino.Config.flashViewEntry, function(bIsRestorable){
				chrome.fileSystem.restoreEntry(Espruino.Config.flashViewEntry, function(theEntry) {
					if(theEntry){
						chrome.fileSystem.getDisplayPath(theEntry,function(path) {
							$("#flashViewFolder").text(path);
						});
					}
					else{Espruino.Core.Status.setStatus("FlashView folder not found");}
				});
			});
		}
	}
	function getProjectSubDir(name,callback){
		checkEntry(Espruino.Config.flashViewEntry,getSubTree);
		function getSubTree(entry){
			var dirReader = entry.createReader();
			dirReader.readEntries (function(results) {
				for(var i = 0; i < results.length; i++){
					if(results[i].name === name){
						callback(results[i]);
						//	console.log("results[i].name:"+results[i].name);
						return;
					}
				}
				console.log("getProjectSubDir("+name+") failed");
				callback(false);
			}, function() { // error callback
				console.log("getProjectSubDir("+name+") failed");
				callback(false);
			});
		}
	}
	function checkEntry(entry,callback){
		if(entry){
			chrome.fileSystem.isRestorable(entry, function(bIsRestorable){
				chrome.fileSystem.restoreEntry(entry, function(theEntry) {
					if(theEntry){ callback(theEntry);}
					else{Espruino.Status.setError("FlashView folder not found");}
				});
			});
		}
	}
	function checkFileExists(dirEntry,fileName,existsCallback,notExistsCallback){
		if (!dirEntry) {
			if (notExistsCallback)notExistsCallback();
			return;
		}

		var dirReader = dirEntry.createReader();
		dirReader.readEntries(function(results){
			var fnd = false;
			for(var i = 0;i < results.length; i++){
				if(results[i].name === fileName){
					existsCallback(results[i]);
					fnd = true;
					break;
				}
			}
			if(!fnd && notExistsCallback){notExistsCallback();}
		});
	}
	function readFilefromEntry(entry,callback){
		var reader = new FileReader();
		reader.onload = function(e){ callback(e.target.result);};
		entry.file(function(file){ reader.readAsText(file);});
	}
	function readDataUrlfromEntry(entry,callback){
		var reader = new FileReader();
		reader.onloadend = function(e){callback(e.target.result);};
		entry.file(function(file){reader.readAsDataURL(file);});
	}
	function saveFileAs(dirEntry,fileName,data){
		dirEntry.getFile(fileName,{create:true},function(fileEntry){
			actualProject = fileEntry;
			fileEntry.createWriter(function(fileWriter){
				var bb = new Blob([data],{type:'text/plain'});
				fileWriter.truncate(bb.size);
				setTimeout(function(evt){
					fileWriter.seek(0);
					fileWriter.write(bb);
				},200);
			});
		});
	}




////////////////ENTRY






	Espruino.Plugins.FlashView = {
			init : init,

			loadModule: loadModule,
			loadFirmware: loadFirmware,
			loadFile: loadFile,
			loadDataUrl: loadDataUrl,
			saveFile: saveFile,
			appendFile: appendFile,
			loadDir: loadDir,
			loadDirHtml: getProjectTable
	};
	/*
	  function getSnippets(html,callback){
	    html += '<div id="s">' + getSnippetTable() + '</div>';
	    callback(html);
	  }
	  function getSnippetTable(){
	    var i,j,html = "";
	    html += '<table width="100%">';
	    j = 0;
	    for(i in snippets){
	      html += '<tr><th>' + i + '</th><th>' + snippets[i] + '</th>';
	      html += '<th title="drop snippet"><button snippet="' + i + '" class="dropSnippet"></button></th></tr>';
	      j++;
	    }
	    html += '<tr><th><input type="text" size="10" id="newSnippetName" value="snippet' + j.toString() + '"></th><th>';
	    html += '<input type="text" id="newSnippetValue" value="console.log();"></th>';
	    html += '<th><button class="addSnippet">Add Snippet</button></th></tr>';
	    html += '</table>';
	    return html;
	  }*/
	/*
	function getProjectSnippets(){
		if(Espruino.Config.flashViewEntry){
			getProjectSubDir("snippets",function(subDirEntry){
				checkFileExists(subDirEntry,"terminalsnippets.txt",function(fileEntry){
					readFilefromEntry(fileEntry,function(data){
						snippets = JSON.parse(data);
					});
				});
			});
		}
	}*/
	/*
	function sendSnippets(evt){
		Espruino.Core.Serial.write(snippets[$(this).html()] + "\n");
		Espruino.Core.App.closePopup();
		$("#terminalfocus").focus();
	}*/
	/*
	function dropSnippet(){
		var i,snp = {};
		var snippet = $(this).attr("snippet");
		for(i in snippets){
			if(i !== snippet){
				snp[i] = snippets[i];
			}
		}
		snippets = snp;
		$("#s").html(getSnippetTable());
		saveSnippets();
		Espruino.Core.App.closePopup();
	}
	function addSnippet(){
		snippets[$("#newSnippetName").val()] = $("#newSnippetValue").val();
		$("#s").html(getSnippetTable());
		saveSnippets();
		Espruino.Core.App.closePopup();
	}
	function saveSnippets(){
		if(Espruino.Config.flashViewEntry){
			getProjectSubDir("snippets",function(subDirEntry){
				if (!subDirEntry) return;
				checkFileExists(subDirEntry,"terminalsnippets.txt",
						function(fileEntry){
					fileEntry.createWriter(function(fileWriter){
						var bb = new Blob([JSON.stringify(snippets)],{type:'text/plain'});
						fileWriter.truncate(bb.size);
						setTimeout(function(evt){
							fileWriter.seek(0);
							fileWriter.write(bb);
						},200);
					});
				},
				function(){
					setTimeout(function(){
						getProjectSubDir("snippets",function(dirEntry){
							if (!dirEntry) return;
							saveFileAs(dirEntry,"terminalsnippets.txt",JSON.stringify(snippets));
						});
					},50);
				}
				);
			});
		}
	}*/
}());
