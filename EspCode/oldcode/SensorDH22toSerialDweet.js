// DHT22: VCC . DATA . NC . GND

pin=NodeMCU.D2;
var dht22 = require("DHT22").connect(pin);
var dht22_read_test = function() {
  dht22.read(
    function(a){
      console.log("Temp is "+a.temp.toString()+ " and RH is "+a.rh.toString());
      var data = {
        temp: a.temp.toString(),
        rh:a.rh.toString()
      };
      if(a.rh> 50) digitalWrite(NodeMCU.D1,1);
      else digitalWrite(NodeMCU.D1,0);
      putDweet("sofiane", data, function(response) {
        console.log(response);
      });
     });
};
setInterval(dht22_read_test,5000);

function putDweet(dweet_name, a, callback) {
  var data = "";
  for (var n in a) {
    if (data.length) data+="&";
    data += encodeURIComponent(n)+"="+encodeURIComponent(a[n]); 
  }
  var options = {
    host: 'dweet.io',
    port: '80',
    path:'/dweet/for/'+dweet_name+"?"+data,
    method:'POST'
  };
  require("http").request(options, function(res)  {
    var d = "";
    res.on('data', function(data) { d+=data; });
    res.on('close', function(data) {
      if (callback) callback(d);
    });
 }).end();
}

// save();
