var  on = false;
setInterval(function() {
  on = !on;
  digitalWrite(D2,on);
 // D2.write(on);
}, 100);