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

Batch.prototype.merge = function(body, options)
{
  this.ops.push(process.call(this, 'MERGE', options, body));
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
  var msg = [];
  var last_changeset = '';
  var body = '';
  var useString = true;
  for(let op of this.ops) {
    if(op.changeset) {
      if(op.changeset != last_changeset) {
        if(last_changeset) {
          msg.push(`--${last_changeset}--\r\n`);
        }
        msg.push(`--${this.boundary}\r\n`);
        msg.push(`Content-Type: multipart/mixed; boundary=${op.changeset}\r\n\r\n`);
      }
      msg.push(`--${op.changeset}\r\n`);
    } else {
      if(last_changeset) {
        msg.push(`--${last_changeset}--\r\n`);
      }
      msg.push(`--${this.boundary}\r\n`);
    }
    last_changeset = op.changeset;
    msg.push('Content-Type: application/http\r\n');
    msg.push('Content-Transfer-Encoding: binary\r\n\r\n');
    msg.push(`${op.method} ${op.query} HTTP/1.1\r\n`);
    let content_type;
    _.forOwn(op.headers, function (v, k) {
      if(k.toLowerCase() === 'content-type') {
        content_type = v;
      } else {
        msg.push(mime.foldLine(`${k}: ${v}`, 76) + '\r\n');
      }
    });
    if(op.body) {
      if(content_type === undefined || _.isPlainObject(op.body)) {
        msg.push('Content-Type: application/json\r\n');
        body = JSON.stringify(op.body);
      } else {
        if(content_type !== undefined) {
          msg.push(`Content-Type: ${content_type}\r\n`);
        }
        if(Buffer && op.body instanceof Buffer) {
          body = op.body;
          useString = false;
        } else {
          body = op.body.toString();
        }
      }
    }
    msg.push(`Content-Length: ${useString ? byteLength(body) : body.length}\r\n\r\n`, body, '\r\n');
  }
  if(last_changeset) {
    msg.push(`--${last_changeset}--\r\n`);
  }
  if(this.ops.length > 0) {
    msg.push(`--${this.boundary}--\r\n`);
  }
  return useString ? msg.join('') : Buffer.concat(msg.map((str) => typeof str === "string" ? Buffer.from(str) : str));
};

module.exports = function(q)
{
  return new Batch(q);
};

// https://stackoverflow.com/a/23329386/3894712
function byteLength(str) {
  if(Buffer) {
    if(str instanceof Buffer) {
      return str.length;
    }
    return Buffer.from(str).length;
  }
  // returns the byte length of an utf8 string
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}