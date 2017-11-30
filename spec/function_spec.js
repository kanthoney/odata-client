'use strict'

const Odata = require('../index');

const config = {
  service: 'https://example.com'
}

describe('function tests', () => {

  let odata;
  beforeEach(() => {
    odata = Odata(config);
  });

  it('should create a function resource', () => {
    expect(odata.fn('MyShoppingCart', {ID: 123, Customer: 'ACME01'}).query()).toBe("https://example.com/MyShoppingCart(ID%3D123%2CCustomer%3D'ACME01')");
  });

  it('should use a function in a filter', () => {
    expect(odata.filter(Odata.fn('SalesRegion', { City: Odata.identifier('$it/City') }), 'ACME Ltd').query())
      .toBe("https://example.com/?%24filter=SalesRegion(City%3D%24it%2FCity)%20eq%20'ACME%20Ltd'");
  });
});

