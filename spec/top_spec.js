'use strict';

const config = {
  service: 'https://example.com',
  resources: 'Customer'
};

describe('top query', function() {

  var odata;
  beforeEach(function() {
    odata = require('../index.js')(config);
  });

  it('should set a top value of 5', function() {
    expect(odata.top(5).query()).toEqual('https://example.com/Customer?%24top=5');
  });

  it('should set a top value of 5', function() {
    expect(odata.top(4).top(5).query()).toEqual('https://example.com/Customer?%24top=5');
  });

});

