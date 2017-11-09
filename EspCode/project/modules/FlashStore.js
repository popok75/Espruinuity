
/* Copyright (c) 2016 Rhys Williams. See the file LICENSE for copying permission. Alpha 1.0*/
/* Modified by Me */

var js=JSON.stringify,jp=JSON.parse,FL=require("Flash"), PF=console.log;

function FlashStore(addr) {
	this.addr = addr;
	var page = FL.getPage(this.addr);
	if (!page)
		throw "Couldn't find flash page";
	this.addr = page.addr;
	this.page_size = page.length;
	try {
		var l = jp(E.toString(FL.read(200, this.addr)).split('}')[0] + '}}')._root.l;
		var contents = E.toString(FL.read(l, this.addr));
		//this.items = jp(contents);
		contents=jp(contents),this.items={};
		for(var k in contents) this.items[k]=js(contents[k]);// encode items
	} catch (x) {
		PF("Flash corrupt! Erasing...", x);
		this.erase();
	};
}
/*
FlashStore.prototype.item = function(key, data, mime) {	//really useless function
//    var FlashItem = require("FlashItem");
	if (data) {
        this.store(key, data, mime);
//        return this.items[key];
        return this.items[key] ? jp(this.items[key]) : undefined;

    }
    return null;	    
};
 */
FlashStore.prototype.toString = function(k) {
	var item = this.items[k] ? jp(this.items[k]) : undefined;
	if (item === undefined) return null;
	console.log("addr:",parseInt(this.addr + item.p * this.page_size, 10));
	console.log(FL.read(item.l, parseInt(this.addr + item.p * this.page_size, 10)));
	return E.toString(FL.read(item.l, parseInt(this.addr + item.p * this.page_size, 10)));
};

/*FlashStore.prototype.length = function() {
    return Object.keys(fs.items).length - 1;
}
/*
FlashStore.prototype.find = function(key) {
//    var FlashItem = require("FlashItem");
    if (this.items[key]) {
        return {p :this,k : key};
    } else
        return null;
}
FlashStore.prototype.address = function(page) {
    return parseInt(this.addr + page * this.page_size, 10);
};*/
FlashStore.prototype.erasePages = function(p0, n) {
	var erase =parseInt(this.addr + p0 * this.page_size, 10);
	for (var p = 0; p < n; p++) {
//		print("erasing",erase);
		FL.erasePage(erase);
		erase = erase + this.page_size;
	}
};

FlashStore.prototype.pipe = function(key, res) {
	var item = this.items[key] ? jp(this.items[key]) : undefined;
	var header = {'Content-Type': item.m, 'Content-Length': item.l};
	header["Access-Control-Allow-Origin"]="*";


	if (item.c) {
		header['Content-Encoding'] = item.c;
	}
	console.log("header",header);
	res.writeHead(200, header);
	if (item === undefined) {
		return null;
	}
	var size = item.l, length = 256,offset = 0,fs = this;
	res.on('drain', function() {
//		console.log("drain fun",item.l,size,offset);
		var s=E.toString(FL.read(Math.min(length, size), parseInt(fs.addr + item.p * fs.page_size, 10) + offset));
//		print("reading at",parseInt(fs.addr + item.p * fs.page_size, 10) + offset,s);
		 
		res.write(s);
		PF("sent ",Math.min(length, size),"bytes");
		size = size - length;
		offset = offset + length;

		if (size <= 0) {
			res.end();
			PF('end.');
		} 
	});
};




FlashStore.prototype.store = function(key, data, mime, len, nosync, compress) {    
	//if (!data) return null;
	if (mime === undefined)
		switch (typeof data) {
		case 'object':
			mime = 'application/json';
			data = js(data);
			break;
		case 'function':
			mime = 'text/javascript';
			data = js(data.toString());
			break;
		default:
			mime = 'text/plain';
		}

	var l = data.length;
	if (len) l = len;    

	var pages = Math.floor(l / this.page_size + 1);
	var item ;
	if(this.decoded) item=this.items[key];
	else  item=this.items[key] ? jp(this.items[key]) : undefined;
	if(item) {// update of existing item
		var opages = Math.floor(item.l / this.page_size + 1);
		// check if allocated space is enough
		if(opages<pages) item = undefined,PF('page for key ' & key & ' too small, reallocating.');	// reallocating
	}

	if (item === undefined) {
		/*    	if(len>0) {
		 *  	var p=1,f=false;// use interpage space, not recommended since it will erase more often the same pages
    	while(p){var s=false;
    		if(p==this.items._root.next_page) break;
	    	for (var i in this.items) 
	    		if(i.page==p) {p=i.page+Math.floor(i.length / this.page_size + 1);s=true;break;}

    		if(!s) f=true;
	    }
		if(p!=this.items._root.next_page) PF("found interspace :",p);
		}
		 */ 	var r=jp(this.items._root);
		 item = {p:r.np};
		 r.np+=pages;
		 this.items._root = js(r);
	}

	this.erasePages(item.p,pages); 
	if(data.length>0) {
//		print("store writing at",parseInt(this.addr + item.p * this.page_size, 10),data);
		var len = data.length;
		while (data.length & 3) data += "\xFF";
		FL.write(data, parseInt(this.addr + item.p * this.page_size, 10));
		item.l = len;
	}
	else item.l=0;
	item.m = mime;
	if(compress) item.c=compress;
	if(!this.decoded) this.items[key] = js(item);
	if (key !== '_root' && !nosync) this.sync();

};



FlashStore.prototype.append = function(key, data) {
	var item = this.items[key] ? jp(this.items[key]) : undefined;

	if (item === undefined) {this.store(key, data);return;}
	var len = data.length + item.l;
	var pages = Math.floor(len / this.page_size + 1);

	if(item) {// update of existing item
		var opages = Math.floor(item.l / this.page_size + 1);
		// check if allocated space is enough
		if(opages<pages) {  // if next page(s) available erase them    // if last item or if noone on next pages
			PF('page for key ' + key + ' too small, reallocate ',opages,pages);
			var olp=item.p+opages;
			PF("olp",olp);
			if(jp(this.items._root).np === olp) this.erasePages(olp,pages-opages); 
			else {var nlp=item.p+pages;
			PF("nlp",nlp);
			for (var i in this.items) {if(jp(this.items[i]).p>=olp && jp(this.items[i]).p<nlp) {PF('reallocation failed, must be moved');return null;}}		// look if required space is occupied
			this.erasePages(olp,pages-opages);          	 
			}	
		}	
	}    
//	console.log("item.l",item.l);
	var addr = parseInt(this.addr + item.p * this.page_size, 10) + item.l;
	if (FL.read(1, addr)[0] != 0xFF) {
		throw ("flash is occupied @ " + addr);
	}
	var offset = addr & 3;
	if (offset) {
		addr -= offset;
		var last = E.toString(FL.read(offset, addr));
	} else last = '';

	if(data.length>0) { // || last.length>0) {
		var ddata=last + data;
//		print("append writing at",addr,ddata,ddata.length);
		while (ddata.length & 3) ddata += "\xFF";
		FL.write(ddata, addr);
	}
	item.l = len;
	this.items[key]=js(item);
//	console.log("append updated items",item);
};

FlashStore.prototype.wget = function(key, uri, options) {
	PF(E.getErrorFlags());
	var http_opt = url.parse(uri);
	if (options && options.compress) http_opt.headers = {'Accept-Encoding': "gzip"};

	PF(http_opt);
	var fs = this;
	var req = require("http").request(http_opt, function(res) {
		PF(res);
		var content_length = res.headers["Content-Length"] || 0;
		var ce = res.headers["Content-Encoding"];
		var mime = (res.headers["Content-Type"]);
		if (options && options.mime) mime=options.mime;
		//   print("content_length:",content_length, fs.page_size * 20)
		fs.store(key, '', mime, content_length,true ,ce);

		var l = 0;
		res.on('data', function(data) {
			l += data.length;
			fs.append(key, data);
			PF({l: l});
		});
		res.on('close', function() {
			PF({done:l});
			fs.sync();
			PF(E.getErrorFlags());
		});
		res.on('error', function(e) {
			PF(e);
		});
	});
	req.end();
};

FlashStore.prototype.erase = function() {
	var er=0;
	if(this.items) er=jp(this.items["_root"]).er;
	this.items = {
			_root: js({
				p: 0,
				np: 2,
				l: 0,
				er:er,
			})
	};
	this.sync();
};

FlashStore.prototype.removeItem = function(k) {
	delete this.items[k];
	this.sync();
};


FlashStore.prototype.sync = function() {
	var a=this.items;
//	print("p",a);
	for(var k in a) {a[k]=jp(a[k]);} // decode items
	//	print(a);
	var rt=a._root;
	rt.er++;
	rt.l = js(a).length;
	rt.l = js(a).length;
	this.decoded=1;
	this.store('_root', a);
	for(var k in a) {a[k]=js(a[k]);} // reencode items
	delete this.decoded;
};

/*
FlashStore.prototype._fwrite = function(data, addr) {
    var len = data.length;
    while (data.length & 3)
        data += "\xFF";
    FL.write(data, addr);
    return len;
};
 */

exports = FlashStore;






/*
var fs = new(require("FlashStore"))(require("Flash").getFree()[3].addr);


require("http").createServer(function (request, response) {
    var u = url.parse(request.url, true);
    var q = fs.items[u.pathname];
    if (q) {
      console.log({match:u.pathname});
      fs.pipe(u.pathname,response);
    } else {
      if ( u.pathname === '/json' ) {
         // response.writeHead(200);
        response.end(Date.now().toString());
        return;
      }
      console.log({   q : u.query,   p : u.pathname  });
      response.writeHead(404);
      response.end("404: Not found");
      print("path not found",u.pathname);
    }

  }).listen(80);
print("server started");*/
