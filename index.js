'use strict';

const Expression = require('./expression');

module.exports.expression = function(field, op, value)
{
  return new Expression(field, op, value);
};

