'use strict';

const odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('lambda tests', function() {

  var q;
  beforeEach(function() {
    q = odata(config);
  });

  it('should filter Customers which have any orders with a value of over 100', function() {
    expect(q.any('Order', 'Value', 'gt', 100).query())
      .toEqual('https://example.com/Customers?%24filter=Order%2Fany(p0%3Ap0%2FValue%20gt%20100)');
  });

  it('should filter Customers which have all orders with a value of below 50', function() {
    expect(q.all('Order', 'Value', 'lt', 50).query())
      .toEqual('https://example.com/Customers?%24filter=Order%2Fall(p0%3Ap0%2FValue%20lt%2050)');
  });

  it('should filter Customers which have all orders with a value of below 50 and line count below 3', function() {
    expect(q.all('Order', 'Value', 'lt', 50).all('Order', 'Lines/$count', '<', 3).query())
      .toEqual('https://example.com/Customers?%24filter=(Order%2Fall(p0%3Ap0%2FValue%20lt%2050))%20and%20' +
               '(Order%2Fall(p1%3Ap1%2FLines%2F%24count%20lt%203))');
  });

  it("should filter Customers which have any orders with an sku of 'ITEM1' or 'ITEM2'", () => {
    expect(q.any('Order', 'Sku', 'in', ['ITEM1', 'ITEM2']).query())
      .toEqual("https://example.com/Customers?%24filter=Order%2Fany(p0%3Ap0%2FSku%20in%20('ITEM1'%2C'ITEM2')");
  })

});

