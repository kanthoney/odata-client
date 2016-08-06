'use strict';

const odata = require('../odata');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('expand tests', function() {
  
  var q;
  beforeEach(function() {
    q = odata(config);
  });

  it("should expand Customers orders", function() {
    expect(q.expand('Orders').query()).toEqual('https://example.com/Customers?%24expand=Orders');
  });

});

