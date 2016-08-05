'use strict';

const Odata = require('../odata');

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
    expect(odata.count().query()).toEqual('https://example.com/Customers?%24count');
  });

});

