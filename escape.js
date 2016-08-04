'use strict';

const _ = require('lodash');

var escape = function(s, noquote)
{
  if(_.isString(s)) {
    if(noquote) {
      return `${s.replace(/\'/g, "''")}`;
    } else {
      return `'${s.replace(/\'/g, "''")}'`;
    }
  }
  if(_.isArray(s)) {
    var els = _.map(s, function(el) {
      return `${escape(el)}`;
    });
    return `[${els.join()}]`;
  }
  if(_.isPlainObject(s)) {
    var els = _.map(_.toPairs(s), function(el) {
      return `${escape(el[0], true)}:${escape(el[1])}`;
    });
    return `{${els.join()}}`;
  }
  return s.toString();
};

module.exports = escape;

