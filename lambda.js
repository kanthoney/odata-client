'use strict';

module.exports = function(type, name, variable, property)
{
  this.type = type;
  this.name = name;
  this.variable = variable;
  this.property = property;
  return this;
};

