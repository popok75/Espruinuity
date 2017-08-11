
var timeout=10*60*1000;
  var threshold=100*60*1000;

new Date();
var t= (new Date(0)).getTime();
if(t<threshold) t=(new Date()).getTime();
console.log("init:"+(new Date(t)).toString());
require("Wifi").setSNTP("us.pool.ntp.org",3);
var prediff=0;
var interval=setInterval(function () {
  var c=(new Date()).getTime();
  var diff=c-t;
  
  
  console.log("ip:"+require("Wifi").getIP().ip);
  
  console.log("init:"+(new Date(t)).toString());
  console.log("current:"+(new Date(c)).toString());
  
  if(diff<threshold) {
    console.log("NOT synced :"+diff/1000);
 //   require("Wifi").setSNTP("us.pool.ntp.org",3);
  }
  else {
    console.log("synced :"+prediff/1000);
    clearInterval(interval);
    return;
  } 
  if(diff>timeout) {
     console.log("sync failed, stopping after "+diff/1000);
    clearInterval(interval);
  }
  prediff=diff;
}
  ,2000);




/*


var http = require("http");
http.get("http://www.google.gr", function(res) {
   console.log("status: " + JSON.stringify(res.headers));
  res.on('data', function(data) {
  //  console.log(data);
  });
});
*/