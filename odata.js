'use strict';

const Expression = require('./expression');
const _ = require('lodash');
const Promise = require('bluebird');
const escape = require('./escape');
const Identifier = require('./identifier');
const Literal = require('./literal');
const request = require('./request');
const Lambda = require('./lambda');
const Url = require('./url');
const Batch = require('./batch');

var Odata = function(config)
{
  this.config = config || {};
  this.url = new Url(this.config.service || '');
  if(config.resources) {
    this.url.addPathComponent(config.resources);
  }
  if(config.custom) {
    this.url.addQueryParameter(config.custom);
  }
  this._headers = config.headers || {};
  this._nextLambda = 0;
  if(config.version) {
    this._headers['OData-Version'] = config.version;
  }
  if(config.maxVersion) {
    this._headers['OData-MaxVersion'] = config.maxVersion;
  }
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

Odata.prototype.all = function(field, property, op, value)
{
  return this.filter(new Lambda('all', field, `p${this._nextLambda++}`, property), op, value);
};

Odata.prototype.any = function(field, property, op, value)
{
  return this.filter(new Lambda('any', field, `p${this._nextLambda++}`, property), op, value);
};

Odata.prototype.resource = function(resource, value)
{
  var component = resource;
  if(value !== undefined) {
    if(_.isPlainObject(value)) {
      var clauses = _.map(_.keys(value), function(k) {
        return `${escape(k, true)}=${escape(value[k])}`;
      });
      component += `(${encodeURIComponent(clauses.join())})`;
    } else {
      component += `(${encodeURIComponent(escape(value))})`;
    }
  }
  this.addPathComponent(component);
  return this;
};

Odata.prototype.select = function(items)
{
  this._select = this._select || [];
  if(_.isArray(items)) {
    Array.prototype.push.apply(this._select, items);
  } else {
    Array.prototype.push.apply(this._select, arguments);
  }
  return this;
};

Odata.prototype.count = function()
{
  this._count = true;
  return this;
};

Odata.prototype.orderby = function(item, dir)
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

Odata.prototype.expand = function(item)
{
  this._expand = this._expand || [];
  if(_.isArray(item)) {
    Array.prototype.push.apply(this._expand, item);
  } else {
    Array.prototype.push.apply(this._expand, arguments);
  }
  return this;
};

Odata.prototype.search = function(search)
{
  this._search = search;
  return this;
};

Odata.prototype.custom = function(name, value)
{
  this.addQueryParameter(name, value);
  return this;
};

Odata.prototype.addPathComponent = function(component)
{
  if(this.batch) {
    this.batch.addPathComponent(component);
  } else {
    this.url.addPathComponent(component);
  }
  return;
};

Odata.prototype.addQueryParameter = function(name, value)
{
  if(this.batch) {
    this.batch.addQueryParameter(name, value);
  } else {
    this.url.addQueryParameter(name, value);
  }
  return;
};

Odata.prototype.batch = function()
{
  this.batch = new Batch(this);
  return this;
};

Odata.prototype.query = function()
{
  if(this._count) {
    this.addPathComponent('%24count');
  }
  if(this.config._format !== undefined && this._count === undefined) {
    this.addQueryParameter('$format', this.config._format);
  }
  if(this._top) {
    this.addQueryParameter('$top', this._top);
  }
  if(this._skip) {
    this.addQueryParameter('$skip', this._skip);
  }
  if(this._filter !== undefined) {
    this.addQueryParameter('$filter', this._filter.toString());
  }
  if(this._select) {
    this.addQueryParameter('$select', _.map(this._select, function(item) {
      return escape(item, true);
    }).join());
  }
  if(this._expand) {
    this.addQueryParameter('$expand', _.map(this._expand, function(item) {
      return escape(item, true);
    }).join());
  }
  if(this._search) {
    this.addQueryParameter('$search', this._search);
  }
  if(this._order !== undefined) {
    this.addQueryParameter('$orderby', this._order);
  }
  return this.url.get();
};

Odata.prototype.get = function(options)
{
  options = options || {};
  if(this.batch) {
    this.batch.get(options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  return request.getAsync(options);
};

Odata.prototype.post = function(body, options)
{
  options = options || {};
  if(this.batch) {
    this.batch.post(body, options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  options.body = body;
  return request.postAsync(options);
};

Odata.prototype.put = function(body, options)
{
  options = options || {};
  if(this.batch) {
    this.batch.put(body, options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  options.body = body;
  return request.putAsync(options);
};

Odata.prototype.patch = function(body, options)
{
  options = options || {};
  if(this.batch) {
    this.batch.patch(body, options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  options.body = body;
  return request.patchAsync(options);
};

Odata.prototype.delete = function(options)
{
  options = options || {};
  if(this.batch) {
    this.batch.delete(options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  return request.deleteAsync(options);
};

Odata.prototype.send = function()
{
  if(!this.batch) {
    return this;
  }
  var u = this.url.clone();
  u.addPathComponent('%24batch');
  var options = {
    url: u.get(),
    headers: _.assign({},
                      this._headers,
                      {'Content-Type': `multipart-mixed; boundary=${this.batch.boundary}`}),
    body: this.batch.body()
  };
  return request.postAsync(options);
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

