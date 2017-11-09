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
        var l = JSON.parse(E.toString(this.flash.read(200, this.addr)).slice(0, 200).split('}')[0] + '}}')._root.length;
        var contents = E.toString(this.flash.read(l, this.addr));
        this.items = JSON.parse(contents);
    } catch (x) {
        console.log("Flash corrupt!", x);
        this.erase();
    };
}
FlashStore.prototype.item = function(key, data, mime) {
    var FlashItem = require("FlashItem");
    return new FlashItem(this, key, data, mime);
}
FlashStore.prototype.length = function() {
    return Object.keys(fs.items).length - 1;
}
FlashStore.prototype.find = function(key) {
    var FlashItem = require("FlashItem");
    if (this.items[key]) {
        return new FlashItem(this, key);
    } else
        return null;
}
FlashStore.prototype.address = function(page) {
    return parseInt(this.addr + page * this.page_size, 10);
}
FlashStore.prototype.pipe = function(key, res) {
    var item = this.items[key];
    var header = {
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
    var size = item.length;
    var length = 128;
    var offset = 0;
    var fs = this;
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
FlashStore.prototype.erase = function() {
    throw ('Use FlashStoreWrite save to Flash first');
};
exports = FlashStore;