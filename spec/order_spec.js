'use strict';

const Odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('orderby tests', function() {
  
  var odata;
  beforeEach(function() {
    odata = Odata(config);
  });

  it('should order Customers resource by balance', function() {
    expect(odata.orderby('balance').query()).toEqual('https://example.com/Customers?%24orderby=balance');
  });

  it('should order Customers resource by balance ascending', function() {
    expect(odata.orderby('balance', 'asc').query()).toEqual('https://example.com/Customers?%24orderby=balance%20asc');
  });

  it('should order Customers resource by balance descending', function() {
    expect(odata.orderby('balance', 'desc').query()).toEqual('https://example.com/Customers?%24orderby=balance%20desc');
  });

  it('should order Customers resource by balance descending', function() {
    expect(odata.orderby(['balance', 'desc']).query()).toEqual('https://example.com/Customers?%24orderby=balance%20desc');
  });

  it('should order Customers resource by PriceGroup then balance descending', function() {
    expect(odata.orderby(['PriceGroup'], ['balance', 'desc']).query())
      .toEqual('https://example.com/Customers?%24orderby=PriceGroup%2Cbalance%20desc');
  });

  it('should order Customers resource by PriceGroup then balance descending (method 2)', function() {
    expect(odata.orderby('PriceGroup').orderby(['balance', 'desc']).query())
      .toEqual('https://example.com/Customers?%24orderby=PriceGroup%2Cbalance%20desc');
  });

});

