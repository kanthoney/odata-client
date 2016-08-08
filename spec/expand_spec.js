'use strict';

const odata = require('../index');

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

  it("should expand Customers orders, attributes", function() {
    expect(q.expand('Orders', 'Attributes').query()).toEqual('https://example.com/Customers?%24expand=Orders%2CAttributes');
  });

  it("should expand Customers orders, attributes (method 2)", function() {
    expect(q.expand('Orders').expand('Attributes').query()).toEqual('https://example.com/Customers?%24expand=Orders%2CAttributes');
  });

});

