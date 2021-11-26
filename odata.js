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
  this.addQueryParameter('$top', top);
  return this;
};

Odata.prototype.skip = function(skip)
{
  this.addQueryParameter('$skip', skip);
  return this;
};

Odata.prototype.filter = function(field, op, value)
{
  if(this._batch) {
    this._batch.filter(field, op, value);
  } else {
    if(this._filter) {
      this._filter = this._filter.and(new Expression(field, op, value));
    } else {
      this._filter = new Expression(field, op, value);
    }
  }
  return this;
};

Odata.prototype.and = function(field, op, value)
{
  return this.filter(field, op, value);
};

Odata.prototype.or = function(field, op, value)
{
  if(this._batch) {
    this._batch.or(field, op, value);
  } else {
    if(this._filter) {
      this._filter = this._filter.or(new Expression(field, op, value));
    } else {
      this._filter = new Expression(field, op, value);
    }
  }
  return this;
};

Odata.prototype.not = function(field, op, value)
{
  if(this._batch) {
    this._batch.not(field, op, value);
    return this;
  }
  return this.filter(`not ${new Expression(field, op, value).toString()}`);
};

Odata.prototype.all = function(field, property, op, value)
{
  if(this._batch) {
    this._batch.all(field, property, op, value);
    return this;
  }
  return this.filter(new Lambda('all', field, `p${this._nextLambda++}`, property), op, value);
};

Odata.prototype.any = function(field, property, op, value)
{
  if(this._batch) {
    this._batch.any(field, property, op, value);
    return this;
  }
  return this.filter(new Lambda('any', field, `p${this._nextLambda++}`, property), op, value);
};

Odata.prototype.resource = function(resource, value)
{
  if(this._batch) {
    this._batch.resource(resource, value);
    return this;
  }
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

Odata.prototype.fn = function(name, args)
{
  if(this._batch) {
    this._batch.fn(name, args);
    return this;
  }
  this.addPathComponent(encodeURIComponent(`${name}(${_.join(_.map(args || {}, (v, k) => { return `${k}=${escape(v)}`; }))})`));
  return this;
}

Odata.prototype.select = function(items)
{
  if(this._batch) {
    if(_.isArray(items)) {
      this._batch.select(items);
    } else {
      this._batch.select(Array.prototype.slice.call(arguments));
    }
    return this;
  }
  this._select = this._select || [];
  if(_.isArray(items)) {
    Array.prototype.push.apply(this._select, items);
  } else {
    Array.prototype.push.apply(this._select, arguments);
  }
  return this;
};

Odata.prototype.count = function(param)
{
  if(this._batch) {
    this._batch.count(param);
    return this;
  }
  this._count = param?'param':true;
  return this;
};

Odata.prototype.orderby = function(item, dir)
{
  if(this._batch) {
    this._batch.orderby(item, dir);
    return this;
  }
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
  if(this._batch) {
    this._batch.expand(item);
    return this;
  }
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
  if(this._batch) {
    return this._batch.search(search);
    return this;
  }
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
  if(this._batch) {
    this._batch.addPathComponent(component);
  } else {
    this.url.addPathComponent(component);
  }
  return;
};

Odata.prototype.addQueryParameter = function(name, value)
{
  if(this._batch) {
    this._batch.addQueryParameter(name, value);
  } else {
    this.url.addQueryParameter(name, value);
  }
  return;
};

Odata.prototype.batch = function()
{
  this._batch = new require('./batch')(this);
  return this;
};

Odata.prototype.query = function()
{
  if(this._count) {
    if(this._count === 'param') {
      this.addQueryParameter('$count', 'true');
    } else {
      this.addPathComponent('%24count');
    }
  }
  if((this.config && this.config.format) !== undefined && this._count === undefined) {
    this.addQueryParameter('$format', this.config.format);
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
  options.headers = options.headers || {};
  if(options.content_id) {
    options.headers['Content-ID'] = options.content_id;
  }
  if(this._batch) {
    this._batch.get(options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  options.method = 'GET';
  return request(options);
};

Odata.prototype.post = function(body, options)
{
  options = options || {};
  options.headers = options.headers || {};
  if(options.content_id) {
    options.headers['Content-ID'] = options.content_id;
  }
  if(this._batch) {
    this._batch.post(body, options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  if(_.isPlainObject(body)) {
    options.body = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
  } else {
    options.body = body;
  }
  options.method = 'POST';
  return request(options);
};

Odata.prototype.put = function(body, options)
{
  options = options || {};
  options.headers = options.headers || {};
  if(options.content_id) {
    options.headers['Content-ID'] = options.content_id;
  }
  if(this._batch) {
    this._batch.put(body, options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  if(_.isPlainObject(body)) {
    options.body = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
  } else {
    options.body = body;
  }
  options.method = 'PUT';
  return request(options);
};

Odata.prototype.patch = function(body, options)
{
  options = options || {};
  options.headers = options.headers || {};
  if(options.content_id) {
    options.headers['Content-ID'] = options.content_id;
  }
  if(this._batch) {
    this._batch.patch(body, options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  if(_.isPlainObject(body)) {
    options.body = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
  } else {
    options.body = body;
  }
  options.method = 'PATCH';
  return request(options);
};

Odata.prototype.merge = function(body, options)
{
  options = options || {};
  options.headers = options.headers || {};
  if(options.content_id) {
    options.headers['Content-ID'] = options.content_id;
  }
  if(this._batch) {
    this._batch.merge(body, options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  if(_.isPlainObject(body)) {
    options.body = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
  } else {
    options.body = body;
  }
  options.method = 'MERGE';
  return request(options);
};

Odata.prototype.delete = function(options)
{
  options = options || {};
  options.headers = options.headers || {};
  if(options.content_id) {
    options.headers['Content-ID'] = options.content_id;
  }
  if(this._batch) {
    this._batch.delete(options);
    return this;
  }
  options.url = this.query();
  options.headers = _.assign({}, this._headers, options.headers);
  options.method = 'DELETE';
  return request(options);
};

Odata.prototype.body = function()
{
  if(this._batch) {
    return this._batch.body().toString();
  }
  return '';
};

Odata.prototype.send = function()
{
  if(!this._batch) {
    return this;
  }
  var u = this.url.clone();
  u.addPathComponent('%24batch');
  var options = {
    url: u.get(),
    headers: _.assign({},
                      this._headers,
                      {'Content-Type': `multipart/mixed; boundary=${this._batch.boundary}`}),
    body: this._batch.body()
  };
  options.method = 'POST'
  return request(options);
};
  
module.exports = Odata;

