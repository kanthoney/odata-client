'use strict';

const uuid = require('uuid');
const _ = require('lodash');
const url = require('url');
const qs = require('querystring');

var Batch = function(q)
{
  this.query = q;
  this.url = q.url.clone();
  this.boundary = `batch_${uuid.v4()}`;
  this.ops = [];
  return this;
};

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
    query: this.url.get(),
    headers: options.headers || {},
    body: body
  }
};

Batch.prototype.reset = function()
{
  this.url = this.query.url.clone();
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
  this.ops.push(process.call(this, 'PUT', q, options, body));
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
    if(op.body) {
      let buf, body = '';
      if(op.headers['Content-Type'] === undefined || _.isPlainObject(op.body)) {
        msg += 'Content-Type: application/json\r\n';
        msg += 'Content-Transfer-Encoding: base64\r\n';
        buf = Buffer(JSON.stringify(op.body)).toString('base64');
      } else {
        msg += `Content-Type: ${op.headers['Content-Type']}\r\n`;
        msg += 'Content-Transfer-Encoding: base64\r\n';
        buf = Buffer(op.body.toString()).toString('base64');
      }
      for(var i = 0; i < buf.length; i += 76) {
        body += `${buf.substr(i, 76)}\r\n`;
      }
      msg += `Content-Length: ${body.length}\r\n\r\n${body}`;
    }
    msg += '\r\n';
  }
  msg += `--${this.boundary}--`;
  return msg;
};

module.exports = function(q)
{
  return new Batch(q);
};

