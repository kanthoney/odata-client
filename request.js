'use strict';

const Promise = require('bluebird');

try {
  const request = require('request');
  module.exports = options => Promise.fromCallback(done => request(options, done));
} catch(error) {
  module.exports = require('got');
}

