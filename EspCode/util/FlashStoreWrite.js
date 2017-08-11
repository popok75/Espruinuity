/* Copyright (c) 2016 Rhys Williams. See the file LICENSE for copying permission. Alpha 1.0*/
var FlashStore=require("FlashStore");var FlashItem=require("FlashItem");FlashStore.prototype._store=function(key,data,mime,len){var item=this.items[key];if(mime===undefined)
switch(typeof data){case'object':mime='application/json';data=JSON.stringify(data);break;case'function':mime='text/javascript';data=JSON.stringify(data.toString());break;default:mime='text/plain';}
var l=data.length;if(len){console.log({'len was':l,'using len:':len});l=len;}
if(l===0){console.log('store: 0 len!');}
var pages=Math.floor(l/this.page_size+1);if(item&&item.pages<pages){console.log('page for key '&key&' too small, reallocating.');item=undefined;}
if(item===undefined){item={};item.page=this.items._root.next_page;this.items._root.next_page=this.items._root.next_page+pages;}
var addr=this.address(item.page);var erase=addr;for(p=0;p<pages;p++){this.flash.erasePage(erase);erase=erase+this.page_size;}
item.length=this._fwrite(data,addr);item.mime=mime;this.items[key]=item;if(key!=='_root')
this.sync();}
FlashStore.prototype.append=function(key,data){var item=this.items[key];if(item===undefined){this._store(key,data);return;}
var len=data.length+item.length;var pages=Math.floor(len/this.page_size+1);if(item&&item.pages<pages){console.log('page for key '&key&' too small, won\'t fit');return null;}
var addr=this.address(item.page)+item.length;if(this.flash.read(1,addr)[0]!=0xFF){throw("flash is occupied @ "+addr);}
var offset=addr&3;if(offset){addr-=offset;var last=E.toString(this.flash.read(offset,addr));}else{last='';}
this._fwrite(last+data,addr);item.length=len;this.items[key]=item;}
FlashStore.prototype.wget=function(key,uri,options){console.log({getErrorFlags:E.getErrorFlags()});var http_opt=url.parse(uri);if(options&&options.compress)
http_opt.headers={'Accept-Encoding':"gzip"};console.log(http_opt);var fs=this;var req=require("http").request(http_opt,function(res){console.log(res);var content_length=res.headers["Content-Length"]||0;var ce=res.headers["Content-Encoding"];var mime=(res.headers["Content-Type"]);fs._store(key,'',mime,content_length||this.page_size*20);if(content_length===0){print('need to deal with 0 content length!');}
if(ce){fs.items[key].compress=ce;console.log({encoding:ce});}
var l=0;res.on('data',function(data){l+=data.length;fs.append(key,data);console.log({l:l});});res.on('close',function(){console.log({done:l});fs.sync();console.log({getErrorFlags:E.getErrorFlags()});});res.on('error',function(e){console.log(e);});});req.end();}
FlashStore.prototype.erase=function(){this.items={_root:{page:0,next_page:1,length:0}};this.sync();};FlashStore.prototype.sync=function(){this.items._root.length=JSON.stringify(this.items).length;this.items._root.length=JSON.stringify(this.items).length;this._store('_root',this.items);}
FlashStore.prototype._fwrite=function(data,addr){var len=data.length;while(data.length&3)
data+="\xFF";this.flash.write(data,addr);return len;}
FlashItem.prototype.end=function(){console.log({end:this.k});}
FlashItem.prototype.write=function(d){this.p.append(this.k,d);this.p.sync();}
FlashItem.prototype.wget=function(uri,opts){this.p.wget(this.k,uri,opts);}
FlashItem.prototype.delete=function(){delete this.p.items[this.k];this.p.sync();}
exports=FlashStore;