'use strict';

const url = require('url');
const qs = require('querystring');
const _ = require('lodash');

var Url = function(u)
{
  if(u) {
    this.qurl = url.parse(u.href || u);
    this.params = qs.parse(this.qurl.query);
  }
  return this;
};

Url.prototype.addPathComponent = function(path)
{
  if(this.qurl.pathname.substr(-1) === '/') {
    this.qurl.pathname += path;
  } else {
    this.qurl.pathname += `/${path}`;
  }
  return;
};

Url.prototype.addQueryParameter = function(name, value)
{
  if(_.isPlainObject(name)) {
    _.assign(this.params, name);
  } else {
    this.params[name] = value;
  }
  return;
};

Url.prototype.get = function()
{
  return url.format(_.assign({}, this.qurl, {search: qs.stringify(this.params)}));
};

Url.prototype.clone = function()
{
  var u = new Url();
  u.qurl = _.assign({}, this.qurl);
  u.params = _.assign({}, this.params);
  return u;
};

module.exports = function(u)
{
  return new Url(u);
};

