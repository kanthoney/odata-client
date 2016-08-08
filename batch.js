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

util.inherits(Batch, Odata);

Batch.prototype.addPathComponent = function(component)
{
  this.url.addPathComponent(component);
};

Batch.prototype.addQueryParameter = function(name, value)
{
  this.url.addQueryParameter(name, value);
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
  this.config = this.parent.config;
  this.url = this.parent.url.clone();
};

var process = function(method, options, body)
{
  options = options || {};
  if(method === 'GET') {
    delete this._changeset;
  } else {
    this._changeset = this._changeset || `changeset_${uuid.v4()}`;
  }
  if(options.qs) {
    this.url.addQueryParameters(options.qs);
  }
  return {
    method: method,
    query: this.query(),
    headers: options.headers || {},
    body: body,
    changeset: this._changeset
  }
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
  var msg = `--${this.boundary}\r\n`;
  var last_changeset = '';
  for(let op of this.ops) {
    if(op.changeset) {
      if(op.changeset != last_changeset) {
        if(last_changeset) {
          msg += `--${last_changeset}--\r\n`;
        }
        msg += `Content-Type: multipart/mixed; boundary=${op.changeset}\r\n`;
        msg += 'Content-Transfer-Encoding: binary\r\n\r\n';
        msg += `--${op.changeset}\r\n`;
      }
    } else {
      if(last_changeset) {
        msg += `--${last_changeset}--\r\n`;
      }
      msg += `--${this.boundary}\r\n`;
    }
    last_changeset = op.changeset;
    msg += 'Content-Type: application/http\r\n';
    msg += 'Content-Transfer-Encoding: binary\r\n\r\n';
    msg += `${op.method} ${op.query} HTTP/1.1\r\n`;
    _.forOwn(op.headers, function(v, k) {
      msg += mime.foldLine(`${k}: ${v}`, 76) + '\r\n';
    });
    let body = '';
    if(op.body) {
      let buf = '';
      if(op.headers['Content-Type'] === undefined || _.isPlainObject(op.body)) {
        msg += 'Content-Type: application/json\r\n';
        msg += 'Content-Transfer-Encoding: binary\r\n';
        buf = JSON.stringify(op.body);
      } else {
        msg += `Content-Type: ${op.headers['Content-Type']}\r\n`;
        msg += 'Content-Transfer-Encoding: binary\r\n';
        buf = op.body.toString();
      }
      
      body = `${buf}`;
    }
    msg += `Content-Length: ${body.length}\r\n\r\n${body}\r\n`;
  }
  if(last_changeset) {
    msg += `--${last_changeset}--\r\n`;
  }
  msg += `--${this.boundary}--\r\n`;
  return msg;
};

module.exports = function(q)
{
  return new Batch(q);
};

