

var measureHumidity = function()
{
  var value = analogRead();
  console.log("Hygrometer value: " + value);
};

setInterval(measureHumidity, 500);