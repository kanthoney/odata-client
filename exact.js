'use strict';

var Exact = function(s)
{
  this.s = s;
  return this;
}

Exact.prototype.toString = function()
{
  return this.s.toString();
};

module.exports = Exact;

