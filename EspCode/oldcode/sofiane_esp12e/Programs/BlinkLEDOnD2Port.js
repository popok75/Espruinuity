// Connect LED to D2 + GND
var toggle = 0;

setInterval(function() {
  toggle = !toggle;
  digitalWrite(D4, toggle);
}, 1000);
