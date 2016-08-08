'use strict';

const Odata = require('../index');

const config = {
  service: 'https://example.com'
};

describe('resource tests', function() {

  var odata;
  beforeEach(function() {
    odata = Odata(config);
  });

  it('should request Customer resource', function() {
    expect(odata.resource('Customer').query()).toEqual('https://example.com/Customer');
  });

  it('should request Customer \'ABC001\' resource', function() {
    expect(odata.resource('Customer', 'ABC001').query()).toEqual('https://example.com/Customer(\'ABC001\')');
  });

  it('should request Orders for Customer \'ABC001\' resource', function() {
    expect(odata.resource('Customer', 'ABC001').resource('Orders').query())
      .toEqual('https://example.com/Customer(\'ABC001\')/Orders');
  });

  it('should request top 5 Orders for Customer \'ABC001\' resource', function() {
    expect(odata.resource('Customer', 'ABC001').resource('Orders').top(5).query())
      .toEqual('https://example.com/Customer(\'ABC001\')/Orders?%24top=5');
  });

  it('should request top 5 Orders for Customer \'ABC001\' where OrderValue > 100', function() {
    expect(odata.resource('Customer', 'ABC001').resource('Orders').top(5).filter('OrderValue', '>', 100).query())
      .toEqual('https://example.com/Customer(\'ABC001\')/Orders?%24top=5&%24filter=OrderValue%20gt%20100');
  });

  it('should request resource Customer(Company=\'Acme\',Account=\'ABC001\')', function() {
    expect(odata.resource('Customer',{Company: 'Acme', Account: 'ABC001'}).query())
      .toEqual('https://example.com/Customer(Company%3D\'Acme\'%2CAccount%3D\'ABC001\')');
  });

});

