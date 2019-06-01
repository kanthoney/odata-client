'use strict';

const escape = require('./escape');
const _ = require('lodash');
const Lambda = require('./lambda');

const ops = {
  '=': 'eq',
  '!=': 'ne',
  '>': 'gt',
  '<': 'lt',
  '>=': 'ge',
  '<=': 'le',
  '+': 'add',
  '-': 'sub',
  '*': 'mul',
  '/': 'div',
  '%': 'mod',
  eq: 'eq',
  ne: 'ne',
  gt: 'gt',
  lt: 'lt',
  ge: 'ge',
  le: 'le',
  add: 'add',
  sub: 'sub',
  mul: 'mul',
  div: 'div',
  mod: 'mod',
  and: 'and',
  or: 'or'
};

var getOp = function(op)
{
  if(op in ops) {
    return ops[op];
  }
  throw new Error(`unimplemented operation '${op}'`);
};

var Expression = function(field, op, value)
{
  this.exp = '';
  if(op === undefined) {
    if(field instanceof Expression) {
      this.exp = field.exp;
    } else if(_.isString(field)) {
      this.exp = field;
    } else {
      this.exp = escape(field, true);
    }
  } else if(field instanceof Lambda) {
    var right;
    if(value === undefined) {
      value = op;
      op = 'eq';
    }
    if(op === 'in') {
      if(!_.isArray(value)) {
        value = [value];
      }
      this.exp = `${escape(field.name, true)}/${field.type}(${field.variable}:${field.variable}/${field.property} in ` +
        `(${_.join(_.map(value, v => escape(v)))})`;
    } else {
      if(value instanceof Expression) {
        right = `(${value.toString()})`;
      } else {
        right = `${escape(value)}`;
      }
      this.exp = `${escape(field.name, true)}/${field.type}(${field.variable}:${field.variable}/${field.property} ${getOp(op)} ${right})`;
    }
  } else {
    var left, right;
    if(field instanceof Expression) {
      left = `(${field.toString()})`;
    } else {
      left = `${escape(field, true)}`;
    }
    if(value === undefined) {
      value = op;
      op = 'eq';
    }
    if(op === 'in') {
      if(!_.isArray(value)) {
        value = [value];
      }
      this.exp = `${left} in (${_.join(_.map(value, v => escape(v)))})`;
    } else {
      if(value instanceof Expression) {
        right = `(${value.toString()})`;
      } else {
        right = `${escape(value)}`;
      }
      this.exp = `${left} ${getOp(op)} ${right}`;
    }
  }
  return this;
};

Expression.prototype.toString = function()
{
  return this.exp;
};

Expression.prototype.op = function(op, value)
{
  var right = new Expression(value);
  return new Expression(`(${this.exp}) ${getOp(op)} (${right.exp})`);
};

Expression.prototype.eq = function(value)
{
  return this.op('=', value);
};

Expression.prototype.ne = function(value)
{
  return this.op('!=', value);
};

Expression.prototype.lt = function(value)
{
  return this.op('<', value);
};

Expression.prototype.gt = function(value)
{
  return this.op('>', value);
};

Expression.prototype.le = function(value)
{
  return this.op('<=', value);
};

Expression.prototype.ge = function(value)
{
  return this.op('>=', value);
};

Expression.prototype.add = function(value)
{
  return this.op('+', value);
};

Expression.prototype.sub = function(value)
{
  return this.op('-', value);
};

Expression.prototype.mul = function(value)
{
  return this.op('*', value);
};

Expression.prototype.div = function(value)
{
  return this.op('/', value);
};

Expression.prototype.mod = function(value)
{
  return this.op('%', value);
};

Expression.prototype.in = function(value)
{
  return new Expression(this, 'in', value);
}

Expression.prototype.and = function(field, op, value)
{
  return new Expression(this, 'and', new Expression(field, op, value));
};

Expression.prototype.or = function(field, op, value)
{
  return new Expression(this, 'or', new Expression(field, op, value));
};

module.exports = Expression;

