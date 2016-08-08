'use strict';

const Odata = require('../index');
const config = {
  service: 'https://example.com',
  resources: 'Customer'
};

describe('filter tests', function() {
  
  var odata;
  beforeEach(function() {
    odata = Odata(config);
  });

  it('should produce a filter account eq \'ABC001\'', function() {
    expect(odata.filter('account', '=', 'ABC001').query())
      .toEqual('https://example.com/Customer?%24filter=account%20eq%20\'ABC001\'');
  });

  it('should produce a filter credit > 5000', function() {
    expect(odata.filter('credit', '>', 5000).query())
      .toEqual('https://example.com/Customer?%24filter=credit%20gt%205000');
  });

  it('should produce a filter credit > 5000 and balance = 0', function() {
    expect(odata.filter('credit', '>', 5000).and('balance', '=', 0).query())
      .toEqual('https://example.com/Customer?%24filter=(credit%20gt%205000)%20and%20(balance%20eq%200)');
  });

  it('should produce a filter credit > 5000 and status = \'stop\'', function() {
    expect(odata.filter('credit', '>', 5000).and('status', '=', 'stop').query())
      .toEqual('https://example.com/Customer?%24filter=(credit%20gt%205000)%20and%20(status%20eq%20\'stop\')');
  });

 it('should produce a filter credit > 5000 and (balance = 0 or status = \'stop\')', function() {
   expect(odata.filter('credit', '>', 5000).and(Odata.expression('balance', 0).or('status', 'stop')).query())
      .toEqual('https://example.com/Customer?%24filter=(credit%20gt%205000)%20and%20((balance%20eq%200)' +
               '%20or%20(status%20eq%20\'stop\'))');
  });

  it('should produce a filter balance > credit', function() {
    expect(odata.filter('balance', '>', Odata.identifier('credit')).query())
      .toEqual('https://example.com/Customer?%24filter=balance%20gt%20credit');
  });

  it('should produce a filter \'ABC001\' eq account', function() {
    expect(odata.filter(Odata.literal('ABC001'), Odata.identifier('account')).query())
      .toEqual('https://example.com/Customer?%24filter=\'ABC001\'%20eq%20account');
  });

});

