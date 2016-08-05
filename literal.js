'use strict';

const escape = require('./escape');

var Literal = function(s)
{
  this.s = s;
  return this;
};

Literal.prototype.toString = function()
{
  return escape(this.s);
};

module.exports = Literal;

