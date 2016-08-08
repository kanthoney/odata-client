'use strict';

const odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('search tests', function() {

  var q;
  beforeEach(function() {
    q = odata(config);
  });

  it('should search for green OR blue', function() {
    expect(q.search('green OR blue').query()).toEqual('https://example.com/Customers?%24search=green%20OR%20blue');
  });

});

