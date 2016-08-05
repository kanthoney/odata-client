'use strict';

const Expression = require('./expression');
const _ = require('lodash');
const Promise = require('bluebird');
const escape = require('./escape');
const Identifier = require('./identifier');
const Literal = require('./literal');

var Odata = function(config)
{
  this.config = config || {};
  this.service = config.service || '';
  this._resources = config.resources || '';
  this._custom = config.custom || {};
  return this;
};

Odata.prototype.top = function(top)
{
  this._top = top;
  return this;
};

Odata.prototype.skip = function(skip)
{
  this._skip = skip;
  return this;
};

Odata.prototype.filter = function(field, op, value)
{
  if(this._filter) {
    this._filter = this._filter.and(new Expression(field, op, value));
  } else {
    this._filter = new Expression(field, op, value);
  }
  return this;
};

Odata.prototype.and = function(field, op, value)
{
  return this.filter(field, op, value);
};

Odata.prototype.or = function(field, op, value)
{
  if(this._filter) {
    this._filter = this._filter.or(new Expression(filter, op, value));
  } else {
    this._filter = new Expression(field, op, value);
  }
  return this;
};

Odata.prototype.not = function(field, op, value)
{
  return this.filter(`not ${new Expression(field, op, value).toString()}`);
};

Odata.prototype.resource = function(resource, value)
{
  if(this._resources !== '') {
    this._resources += '/';
  }
  this._resources += `${resource}`;
  if(value !== undefined) {
    if(_.isPlainObject(value)) {
      var clauses = _.map(_.keys(value), function(k) {
        return `${escape(k, true)}=${escape(value[k])}`;
      });
      this._resources += `(${encodeURIComponent(clauses.join())})`;
    } else {
      this._resources += `(${encodeURIComponent(escape(value))})`;
    }
  }
  return this;
};

Odata.prototype.select = function(items)
{
  this._select = this._select || [];
  Array.prototype.push.apply(this._select, items);
  return this;
};

Odata.prototype.count = function()
{
  this._count = true;
  return this;
};

Odata.prototype.order = function(item, dir)
{
  var self = this;
  this._order = this._order || '';
  var add = function(item, dir) {
    if(self._order !== '') {
      self._order += ',';
    }
    if(dir === undefined) {
      self._order += `${escape(item, true)}`;
    } else {
      if(!dir || dir.toString().toLowerCase() === 'desc') {
        dir = 'desc';
      } else {
        dir = 'asc';
      }
      self._order += `${escape(item, true)} ${dir}`;
    }
  }
  if(_.isArray(item)) {
    for(let i = 0; i < arguments.length; i++) {
      let arg = arguments[i];
      if(_.isArray(arg)) {
        if(arg.length >= 2) {
          add(arg[0], arg[1]);
        } else {
          add(arg[0]);
        }
      } else {
        add(arg);
      }
    }
  } else {
    add(item, dir);
  }
  return this;
};

Odata.prototype.custom = function(name, value)
{
  if(value === undefined && _.isPlainObject(value)) {
    _.assign(this._custom, value);
  } else {
    _.assign(this._custom, {name: value});
  }
  return this;
};

Odata.prototype.query = function()
{
  var q = `${this.service}/${this._resources}`;
  var sep = '?'
  var addPart = function(name, value)
  {
    if(value === undefined) {
      q += `${sep}${encodeURIComponent(name)}`;
    } else {
      q += `${sep}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    }
    sep = '&';
    return;
  };
  if(this._format !== undefined && this._count === undefined && this._batch === undefined) {
    addPart('$format', this._format);
  }
  if(this._count) {
    addPart('$count');
  }
  if(this._top) {
    addPart('$top', this._top);
  }
  if(this._skip) {
    addPart('$skip', this._skip);
  }
  if(this._filter !== undefined) {
    addPart('$filter', this._filter.toString());
  }
  if(this._select) {
    addPart('$select', _.map(this._select, function(item) {
      return escape(item);
    }).join());
  }
  if(this._order !== undefined) {
    addPart('$orderby', this._order);
  }
  if(!_.isEmpty(this._custom)) {
    _.forOwn(this._custom, function(v, k) {
      addPart(k, v);
    });
  }
  return q;
};

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

