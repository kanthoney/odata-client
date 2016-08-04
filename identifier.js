'use strict';

var Identifier = function(s)
{
  this.s = s;
  return this;
};

Identifier.prototype.toString = function()
{
  return this.s.toString();
};

module.exports = Identifier;

