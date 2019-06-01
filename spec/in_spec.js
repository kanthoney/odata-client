'use strict';

const odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('in tests', () => {

  var q;
  beforeEach(() => {
    q = odata(config);
  });

  it('should filter Customers with an id of 1, 2 or 4', () => {
    expect(q.filter('id', 'in', [1,2,4]).query()).toEqual('https://example.com/Customers?%24filter=id%20in%20(1%2C2%2C4)');
  });

  it("should filter Customers with an id of 'a', 'b' or 34", () => {
    expect(q.filter('id', 'in', ['a', 'b', 34]).query()).toEqual("https://example.com/Customers?%24filter=id%20in%20('a'%2C'b'%2C34)");
  });
});

