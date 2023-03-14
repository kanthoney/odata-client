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
    } else if(field === undefined) {
      this.exp = '';
    /*} else if(_.isPlainObject(field)) {
      const fields = Object.keys(field).reduce((acc, k) => acc.concat([[k, field[k]]]), []);
      this.and(fields);
    } else if(field instanceof Array) {
      this.or(field);*/
    } else {
      this.exp = escape(field, true);
    }
  } else if(field instanceof Lambda) {
    var right;
    if(value === undefined) {
      value = op;
      op = 'eq';
    }
    if(['or', 'and'].includes(op)) {
      this.brackets = op
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
  } else if(field === undefined) {
    this.exp = '';
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
    if(['or', 'and'].includes(op)) {
      this.brackets = op
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
  if(field instanceof Array) {
    let expressions = field.reduce((acc, f) => {
      let E;
      if(f instanceof Expression) {
        E = f;
      } else if(f instanceof Array) {
        E = new Expression(...f);
      } else {
        E = new Expression(f);
      }
      if(E.exp) {
        if((E.brackets || 'and') === 'and') {
          acc.push(E.toString());
        } else {
          acc.push(`(${E.toString()})`);
        }
      }
      return acc;
    }, []);
    if(expressions.length > 0) {
      if(this.exp) {
        if((this.brackets || 'and') === 'and') {
          this.exp = [].concat(this.exp, expressions).join(' and ');
        } else {
          this.exp = [].concat(`(${this.exp})`, expressions).join(' and ');
        }
      } else {
        this.exp = `${expressions.join(' and ')}`;
      }
      this.brackets = 'and';
    }
    return this;
  }
  let E;
  if(this.exp) {
    if(field instanceof Expression && op === undefined && value === undefined) {
      E = field;
    } else {
      E = new Expression(field, op, value);
    }
    if(E.exp) {
      if(this.brackets === 'or') {
        this.exp = `(${this.exp})`;
      }
      this.brackets = 'and';
      if((E.brackets || 'and') === 'and') {
        this.exp = [].concat(this.exp, E.exp).join(' and ');
      } else {
        this.exp = [].concat(this.exp, `(${E.exp})`).join(' and ');
      }
    }
    this.brackets = 'and';
    return this;
  }
  return new Expression(field, op, value);
};

Expression.prototype.or = function(field, op, value)
{
  if(field instanceof Array) {
    let expressions = field.reduce((acc, f) => {
      let E;
      if(f instanceof Expression) {
        E = f;
      } else if(f instanceof Array) {
        E = new Expression(...f);
      } else if(_.isPlainObject(f)) {
        E = new Expression().and(Object.keys(f).reduce((acc, k) => acc.concat([[k, f[k]]]), []));
      } else {
        E = new Expression(f);
      }
      if(E.exp) {
        if((E.brackets || 'or') === 'or') {
          acc.push(E.toString());
        } else {
          acc.push(`(${E.toString()})`);
        }
      }
      return acc;
    }, []);
    if(expressions.length > 0) {
      if(this.exp) {
        if((this.brackets || 'or') === 'or') {
          this.exp = [].concat(this.exp, expressions).join(' or ');
        } else {
          this.exp = [].concat(`(${this.exp})`, expressions).join(' or ');
        }
      } else {
        this.exp = expressions.join(' or ');
      }
      this.brackets = 'or';
    }
    return this;
  }
  if(this.exp) {
    let E;
    if(field instanceof Expression && op === undefined && value === undefined) {
      E = field;
    } else {
      E = new Expression(field, op, value);
    }
    if(E.exp) {
      if(this.brackets === 'and') {
        this.exp = `(${this.exp})`;
      }
      this.brackets = 'or';
      if((E.brackets || 'or') === 'or') {
        this.exp = [].concat(this.exp, E.exp).join(' or ');
      } else {
        this.exp = [].concat(this.exp, `(${E.exp})`).join(' or ');
      }
    }
    return this;
  }
  return new Expression(field, op, value);
};

module.exports = Expression;

