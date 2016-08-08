'use strict';

const uuid = require('uuid');
const _ = require('lodash');
const url = require('url');
const qs = require('querystring');
const mime = require('mimelib');
const Odata = require('./odata');
const util = require('util');
const Expression = require('./expression');

var Batch = function(parent)
{
  this.parent = parent;
  this.boundary = `batch_${uuid.v4()}`;
  this.ops = [];
  this.reset();
  return this;
};

console.log(Odata);
util.inherits(Batch, Odata);

Batch.prototype.addPathComponent = function(component)
{
  this.url.addPathComponent(component);
};

Batch.prototype.addQueryParameter = function(name, value)
{
  this.url.addQueryParameter(name, value);
};

var process = function(method, options, body)
{
  options = options || {};
  if(options.qs) {
    this.url.addQueryParameters(options.qs);
  }
  return {
    method: method,
    query: this.query(),
    headers: options.headers || {},
    body: body
  }
};

Batch.prototype.reset = function()
{
  if(this.parent._filter) {
    this._filter = new Expression(this.parent._filter);
  } else {
    delete this._filter;
  }
  if(this.parent._select) {
    this._select = _.slice(this.parent._select);
  } else {
    delete this._select;
  }
  this._count = this.parent._count;
  if(this.parent._order) {
    this._order = this.prent._order;
  } else {
    delete this._order;
  }
  if(this.parent._expand) {
    this._expand = this.parent._expand;
  } else {
    delete this._expand;
  }
  if(this.parent._search) {
    this._search = this.parent._search;
  } else {
    delete this._search;
  }
  this.url = this.parent.url.clone();
};

Batch.prototype.get = function(options)
{
  this.ops.push(process.call(this, 'GET', options));
  this.reset();
  return;
};

Batch.prototype.post = function(body, options)
{
  this.ops.push(process.call(this, 'POST', options, body));
  this.reset();
  return;
}

Batch.prototype.put = function(body, options)
{
  this.ops.push(process.call(this, 'PUT', options, body));
  this.reset();
  return;
}

Batch.prototype.patch = function(body, options)
{
  this.ops.push(process.call(this, 'PATCH', options, body));
  this.reset();
  return;
}

Batch.prototype.delete = function(options)
{
  this.ops.push(process.call(this, 'DELETE', options));
  this.reset();
  return;
};

Batch.prototype.body = function()
{
  var msg = '';
  for(let op of this.ops) {
    msg += `--${this.boundary}\r\n`;
    msg += 'Content-Type: application/http\r\n\r\n';
    msg += `${op.method} ${op.query} HTTP/1.1\r\n`;
    _.forOwn(op.headers, function(v, k) {
      msg += mime.foldLine(`${k}: ${v}`, 76) + '\r\n';
    });
    let body = '';
    if(op.body) {
      let buf = '';
      if(op.headers['Content-Type'] === undefined || _.isPlainObject(op.body)) {
        msg += 'Content-Type: application/json\r\n';
        msg += 'Content-Transfer-Encoding: base64\r\n';
        buf = Buffer(JSON.stringify(op.body)).toString('base64');
      } else {
        msg += `Content-Type: ${op.headers['Content-Type']}\r\n`;
        msg += 'Content-Transfer-Encoding: base64\r\n';
        buf = Buffer(op.body.toString()).toString('base64');
      }
      
      body = `${mime.foldLine(buf, 76, true)}\r\n`;
    }
    msg += `Content-Length: ${body.length}\r\n\r\n${body}`;
  }
  if(this.ops.length > 0) {
    msg += `--${this.boundary}--`;
  }
  return msg;
};

module.exports = function(q)
{
  return new Batch(q);
};

