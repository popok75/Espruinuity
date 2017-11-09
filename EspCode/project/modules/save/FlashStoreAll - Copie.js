
/*
var fs = new(require("FlashStoreWrite"))(require("Flash").getFree()[3].addr);
fs.item('example','store me!');

var fs = new(require("FlashStoreAll"))(require("Flash").getFree()[3].addr);

require("Flash").getPage(require("Flash").getFree()[3].addr)

E.toString(require("Flash").read(200, require("Flash").getFree()[3].addr));
JSON.parseE.toString(require("Flash").read(200, require("Flash").getFree()[3].addr)).slice(0, 200).split('}')[0] + '}}')

fs.item('/').wget('http://www.espruino.com/');

*/

var js=JSON.stringify,jp=JSON.parse;

function FlashItem(parent, key, data, mime) {
    this.p = parent;
    this.k = key;
    if (data) {
        parent._store(key, data, mime);
    }
}

FlashItem.prototype.pipe = function(res) {
    this.p.pipe(this.k, res);
}
FlashItem.prototype.toString = function() {
    var item = this.p.items[this.k];
    if (item === undefined) {
        return null;
    }
    return E.toString(this.p.flash.read(item.length, this.p.address(item.page)));
}
/*
FlashItem.prototype.module = function() {
    Modules.addCached(this.k, this.toString());
    return this.k;
}*/
FlashItem.prototype.valueOf = function() {
    var s = this.toString();
    switch (this.p.items[this.k].mime) {
        case 'application/json':
            var s = jp(s);
            break;
        case 'text/javascript':
            return s = eval(s);
    }
    return s;
}
//exports = FlashItem;

/* Copyright (c) 2016 Rhys Williams. See the file LICENSE for copying permission. Alpha 1.0*/
function FlashStore(addr, flash) {
    this.addr = addr;
    this.flash = flash ? flash : require("Flash");
    var page = this.flash.getPage(this.addr);
    if (!page)
        throw "Couldn't find flash page";
    this.addr = page.addr;
    this.page_size = page.length;
    try {
        var l = jp(E.toString(this.flash.read(200, this.addr)).slice(0, 200).split('}')[0] + '}}')._root.length;
        var contents = E.toString(this.flash.read(l, this.addr));
        this.items = jp(contents);
    } catch (x) {
        console.log("Flash corrupt!", x);
        this.erase();
    };
}
FlashStore.prototype.item = function(key, data, mime) {
//    var FlashItem = require("FlashItem");
    return new FlashItem(this, key, data, mime);
}
FlashStore.prototype.length = function() {
    return Object.keys(fs.items).length - 1;
}
FlashStore.prototype.find = function(key) {
//    var FlashItem = require("FlashItem");
    if (this.items[key]) {
        return new FlashItem(this, key);
    } else
        return null;
}
FlashStore.prototype.address = function(page) {
    return parseInt(this.addr + page * this.page_size, 10);
}
FlashStore.prototype.pipe = function(key, res) {
    var item = this.items[key], header = {
        'Content-Type': item.mime,
        'Content-Length': item.length
    };
    if (item.compress) {
        header['Content-Encoding'] = item.compress;
    }
    res.writeHead(200, header);
    if (item === undefined) {
        return null;
    }
    var size = item.length,length = 128,offset = 0,fs = this;
    res.on('drain', function() {
        res.write(E.toString(fs.flash.read(Math.min(length, size), fs.address(item.page) + offset)));
        size = size - length;
        offset = offset + length;
        if (size <= 0) {
            res.end();
            console.log('end.');
        }
    });
}
/*
FlashStore.prototype.erase = function() {
    throw ('Use FlashStoreWrite save to Flash first');
};
exports = FlashStore;
*/
/* Copyright (c) 2016 Rhys Williams. See the file LICENSE for copying permission. Alpha 1.0*/
//var FlashStore = require("FlashStore");
//var FlashItem = require("FlashItem");

FlashStore.prototype._store = function(key, data, mime, len) {
    var item = this.items[key];
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
    if (len) {
     /*   console.log({
            'len was': l,
            'using len:': len
        });*/
        l = len;
    }
//    if (l === 0) {console.log('store: 0 len!');}
    var pages = Math.floor(l / this.page_size + 1);
//    console.log("item:",item);
//    if(item) console.log("pages:",item.pages);
    if (item && item.pages < pages) {
        console.log('page for key ' & key & ' too small, reallocating.');
        item = undefined;
    }
    if (item === undefined) {
        item = {page:this.items._root.next_page, pages:pages};
        this.items._root.next_page = this.items._root.next_page + pages;
    }
    var addr = this.address(item.page);
    var erase = addr;
    for (var p = 0; p < pages; p++) {
        this.flash.erasePage(erase);
        erase = erase + this.page_size;
    }
    item.length = this._fwrite(data, addr);
    item.mime = mime;
    this.items[key] = item;
    if (key !== '_root')
        this.sync();
}
FlashStore.prototype.append = function(key, data) {
    var item = this.items[key];
    if (item === undefined) {
        this._store(key, data);
        return;
    }
    var len = data.length + item.length;
    var pages = Math.floor(len / this.page_size + 1);
 //   console.log("item:",item);
 //   if(item) console.log("pages:",item.pages);
    
    if (item && item.pages < pages) {
        console.log('page for key ' & key & ' too small, won\'t fit');
        return null;
    }
    var addr = this.address(item.page) + item.length;
    if (this.flash.read(1, addr)[0] != 0xFF) {
        throw ("flash is occupied @ " + addr);
    }
    var offset = addr & 3;
    if (offset) {
        addr -= offset;
        var last = E.toString(this.flash.read(offset, addr));
    } else {
        last = '';
    }
    this._fwrite(last + data, addr);
    item.length = len;
    this.items[key] = item;
}
FlashStore.prototype.wget = function(key, uri, options) {
    console.log(E.getErrorFlags());
    var http_opt = url.parse(uri);
    if (options && options.compress) http_opt.headers = {'Accept-Encoding': "gzip"};
    
    console.log(http_opt);
    var fs = this;
    var req = require("http").request(http_opt, function(res) {
        console.log(res);
        var content_length = res.headers["Content-Length"] || 0;
        var ce = res.headers["Content-Encoding"];
        var mime = (res.headers["Content-Type"]);
        if (options && options.mime) mime=options.mime;
     //   print("content_length:",content_length, fs.page_size * 20)
        fs._store(key, '', mime, content_length || fs.page_size * 20);
      //TODO
/*        if (content_length === 0) {
            print('need to deal with 0 content length!');
        }*/
        if (ce) {
            fs.items[key].compress = ce;
            console.log({
                encoding: ce
            });
        }
        var l = 0;
        res.on('data', function(data) {
            l += data.length;
            fs.append(key, data);
            console.log({
                l: l
            });
        });
        res.on('close', function() {
            console.log({
                done: l
            });
            var it=fs.items[key];
             it.pages=Math.floor(it.length / fs.page_size + 1);
             if(fs.items._root.next_page === (it.page+21)) fs.items._root.next_page=it.page+ it.pages;
            fs.sync();
            console.log(E.getErrorFlags());
        });
        res.on('error', function(e) {
            console.log(e);
        });
    });
    req.end();
}
FlashStore.prototype.erase = function() {
    this.items = {
        _root: {
            page: 0,
            next_page: 1,
            length: 0
        }
    };
    this.sync();
};
FlashStore.prototype.sync = function() {
    this.items._root.length = js(this.items).length;
    this.items._root.length = js(this.items).length;
    this._store('_root', this.items);
}
FlashStore.prototype._fwrite = function(data, addr) {
    var len = data.length;
    while (data.length & 3)
        data += "\xFF";
    this.flash.write(data, addr);
    return len;
}
FlashItem.prototype.end = function() {
    console.log({
        end: this.k
    });
}
FlashItem.prototype.write = function(d) {
    this.p.append(this.k, d);
    this.p.sync();
}
FlashItem.prototype.wget = function(uri, opts) {
    this.p.wget(this.k, uri, opts);
}
FlashItem.prototype.delete = function() {
    delete this.p.items[this.k];
    this.p.sync();
}
exports = FlashStore;