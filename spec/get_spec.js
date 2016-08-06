'use script';

const odata = require('../odata');

const config = {
  service: 'http://services.odata.org/V4/OData/OData.svc'
};

describe('HTTP tests', function() {

  var q;
  beforeEach(function() {
    q = odata(config);
  });

  it('should perform a get request', function(done) {
    q.get()
      .then(function(response) {
        expect(response.statusCode).toEqual(200);
      })
      .catch(function(err) {
        fail(err);
      })
      .finally(done);
  });

  it('should perform a get request to Products resource', function(done) {
    q.resource('Products').get()
      .then(function(response) {
        expect(response.statusCode).toEqual(200);
      })
      .catch(function(err) {
        fail(err);
      })
      .finally(done);
  });

  it('should perform a get request to Products(1) resource', function(done) {
    q.resource('Products', 1).get()
      .then(function(response) {
        expect(response.statusCode).toEqual(200);
      })
      .catch(function(err) {
        fail(err);
      })
      .finally(done);
  });

  it('should get top 5 Products, retrieving ID, Name, Description', function(done) {
    q.resource('Products').select('ID', 'Name', 'Description').top(5).get()
      .then(function(response) {
        expect(response.statusCode).toEqual(200);
      })
      .catch(function(err) {
        fail(err);
      })
      .finally(done);
  });

  it('should get top 5 Products, retrieving ID, Name, Description, Price where price > 200', function(done) {
    q.resource('Products').select('ID', 'Name', 'Description', 'Price').top(5).filter('Price', '>', 200).get()
      .then(function(response) {
        expect(response.statusCode).toEqual(200);
      })
      .catch(function(err) {
        fail(err);
      })
      .finally(done);
  });

});

