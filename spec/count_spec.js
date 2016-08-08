'use strict';

const Odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('count tests', function() {
  
  var odata;
  beforeEach(function() {
    odata = Odata(config);
  });

  it('should get a count of Customers', function() {
    expect(odata.count().query()).toEqual('https://example.com/Customers/%24count');
  });

  it('should get a count of Customers with balance > 1000', function() {
    expect(odata.filter('balance', '>', 1000).count().query())
      .toEqual('https://example.com/Customers/%24count?%24filter=balance%20gt%201000');
  });

});

