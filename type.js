'use strict';

const escape = require('./escape');

module.exports = function(type, value)
{
  this.type = type;
  this.value = value;
};

module.exports.prototype.toString = function()
{
  return `${this.type}${escape(this.value)}`;
};

