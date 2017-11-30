'use strict';

const Odata = require('./odata');
const Identifier = require('./identifier');
const Literal = require('./literal');
const Expression = require('./expression');
const Function = require('./function');

module.exports = function(config)
{
  return new Odata(config);
};

module.exports.expression = function(field, op, value)
{
  return new Expression(field, op, value);
};

module.exports.identifier = function(value)
{
  return new Identifier(value);
};

module.exports.literal = function(value)
{
  return new Literal(value);
};

module.exports.fn = function(name, args)
{
  return new Function(name, args);
}

