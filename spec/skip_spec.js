'use strict';

const config = {
  service: 'https://example.com',
  resources: 'Customer'
};

describe('skip query', function() {

  var odata;
  beforeEach(function() {
    odata = require('../odata.js')(config);
  });

  it('should set a skip value of 5', function() {
    expect(odata.skip(5).query()).toEqual('https://example.com/Customer?%24skip=5');
  });

  it('should set a skip value of 5', function() {
    expect(odata.skip(4).skip(5).query()).toEqual('https://example.com/Customer?%24skip=5');
  });

  it('should set a skip value of 5 and a top value of 4', function() {
    expect(odata.top(4).skip(5).query()).toEqual('https://example.com/Customer?%24top=4&%24skip=5');
  });

});

