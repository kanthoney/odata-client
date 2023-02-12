'use strict';

const Promise = require('bluebird');

try {
  const request = require('request');
  module.exports = options => Promise.fromCallback(done => request(options, done));
} catch(error) {
  const got = import('got');
  module.exports = options => got.then(({ got }) => got(options));
}

