function FlashItem(parent,key,data,mime){this.p=parent;this.k=key;if(data){parent._store(key,data,mime);}}
FlashItem.prototype.pipe=function(res){this.p.pipe(this.k,res);}
FlashItem.prototype.toString=function(){var item=this.p.items[this.k];if(item===undefined){return null;}
return E.toString(this.p.flash.read(item.length,this.p.address(item.page)));}
FlashItem.prototype.module=function(){Modules.addCached(this.k,this.toString());return this.k;}
FlashItem.prototype.valueOf=function(){var s=this.toString();switch(this.p.items[this.k].mime){case'application/json':var s=JSON.parse(s);break;case'text/javascript':return s=eval(s);}
return s;}
exports=FlashItem;