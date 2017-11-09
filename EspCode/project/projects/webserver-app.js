
/*var options = {
    host: 'google.com',
    port: '80',
    path:'/',
    method:'GET',
    headers:{'Accept-Encoding': "gzip"}
  };
options={
    host: 'fnpaste.com',
    port: '80',
    path:'/qR6o/raw',
    protocol: "https:",
    method:'GET',
 //   headers:{"Accept-Encoding": "gzip"}
  };
//https://fnpaste.com/qR6o/raw
// https://nopaste.linux-dev.org/?1162344&download
//https://pastebin.com/raw/1yzDEdb9

var req=require("http").request(options, function(res)  {
    var d = "";
    
    print("got page : ",res);
    print(res.headers["Content-Length"]);
    res.on('data', function(data) {console.log("data:",data); });
    res.on('close', function(data) {
      console.log("closed");
    });
 });
  console.log(req);
  req.on('error', function(e) {console.log("ERROR", e);});
  req.end();*/


//fs.item('/images/logo.png').delete();

//fs.item('/favicon.ico').wget('http://www.espruino.com/favicon.ico');
//fs.item('/images/logo.png').wget('http://www.espruino.com/images/logo.png');
//fs.item('/exemple/').wget('https://nopaste.linux-dev.org/?1162345&download');



var fs = new(require("FlashStoreAll"))(require("Flash").getFree()[3].addr);


function Doc() {
    this.str='';
}

Doc.prototype.write=function(s) {
    this.str+=s;
  this.str+='\n';
};

Doc.prototype.toString=function(){return this.str;};

var document=new Doc();

  
// http://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/
document.write("<html lang=\"en\">");
document.write("  <head>");
document.write("    <meta charset=\"utf-8\">");
document.write("    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">");
document.write("    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
document.write("    <link rel=\"stylesheet\" href=\"http:\/\/maxcdn.bootstrapcdn.com\/bootstrap\/3.3.5\/css\/bootstrap.min.css\">");
document.write("  <\/head>");
document.write("  <body>");
document.write("    <div class=\"well well-lgt\">  ");
document.write("      <div class=\"panel-heading\">");
document.write("        <h3>Web Flash Server<\/h3>");
document.write("      <\/div>");
document.write("      <button class=\"btn btn-warning\" id=\"send\" onclick=\"action(this);\">Send to Espruino<\/button>");
document.write("      <ul id=\"list\" class=\"list-group\">");
document.write("        <li class=\"list-group-item\"><\/li>");
document.write("        <li class=\"list-group-item\"><img src=\"\/images\/logo.png\"><\/li>");
document.write("      <\/ul>");
document.write("    <\/div>");
document.write("    <script src=\"\/js\/app.js\"><\/script>");
document.write("  <\/body>");
document.write("<\/html>");
  
console.log( document.toString() );

fs.item('/',document.toString(),'text/html');

document.str='';

document.write("var count=1;");
document.write("function action(btn) {");
document.write("  btn.innerHTML = 'Send ' + count;");
document.write("  send_json(count);");
document.write("    count = count + 1;");
document.write("}");
document.write("function add(text) {");
document.write("  var ul = document.getElementById(\"list\");");
document.write("  var li = document.createElement(\"li\");");
document.write("  li.className = \"list-group-item\";");
document.write("  li.appendChild(document.createTextNode(text));");
document.write("  ul.appendChild(li);");
document.write("}");
document.write("function send_json(count) {");
document.write("  count = count + 1;");
document.write("  var xhttp = new XMLHttpRequest();");
document.write("  xhttp.onreadystatechange = function () {");
document.write("    if (xhttp.readyState == 4 && xhttp.status == 200) {");
document.write("      add(xhttp.responseText);");
document.write("    }");
document.write("  };");
document.write("  xhttp.open(\"GET\", \"\/json?count=\" + count, true);");
document.write("  xhttp.send();");
document.write("};");

fs.item('/js/app.js',document.toString(),'application/javascript');

print( process.memory());

delete document;

print( process.memory());

var fs = new(require("FlashStoreAll"))(require("Flash").getFree()[3].addr);

require("http").createServer(function (request, response) {
    var u = url.parse(request.url, true);
    var q = fs.find(u.pathname);
    if (q) {
      console.log({match:u.pathname});
      q.pipe(response);
    } else {
      if ( u.pathname === '/json' ) {
         // response.writeHead(200);
        response.end(Date.now().toString());
        return;
      }
      console.log({   q : u.query,   p : u.pathname  });
      response.writeHead(404);
      response.end("404: Not found");
    }

  }).listen(80);
print(process.memory());
