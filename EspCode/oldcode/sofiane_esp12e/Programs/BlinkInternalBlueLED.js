var toggle = 1;

setInterval(function() {
  toggle = !toggle;
  digitalWrite(D2, toggle);
}, 500);