/* Copyright (c) 2016 MyName See the file LICENSE for copying permission. */
/*Playing with modules
Comments: Demo of a simple local module.
Dependencies: no other modules are required 
Example of use code
var r = new (require("Add"))(1,2);
  console.log(r.read());
*/
function Add(a,b) {
  this.A=a;
  this.B=b;
}
exports = Add;
/* Returns sum of A and B*/
Add.prototype.read = function() { return this.A+this.B; };
