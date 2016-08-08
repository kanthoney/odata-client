'use strict';

const odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('select tests', function() {
  var q;
  beforeEach(function() {
    q = odata(config);
  });

  it('should select a single parameter', function() {
    expect(q.select('Account').query()).toEqual('https://example.com/Customers?%24select=Account');
  });

  it('should select a several parameters', function() {
    expect(q.select('Account', 'Status').query()).toEqual('https://example.com/Customers?%24select=Account%2CStatus');
  });

  it('should select an array of parameters', function() {
    expect(q.select(['Account', 'Status']).query()).toEqual('https://example.com/Customers?%24select=Account%2CStatus');
  });

  it('should select several parameters (method 2)', function() {
    expect(q.select('Account').select('Status').query()).toEqual('https://example.com/Customers?%24select=Account%2CStatus');
  });

  it('should select *', function() {
    expect(q.select('*').query()).toEqual('https://example.com/Customers?%24select=*');
  });

});

