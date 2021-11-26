'use strict';

const request = require('../request');
const Odata = require('../index');

describe('batch tests', function() {

  var config;
  var q;
  beforeAll(function(done) {
    request({ method: 'GET', url: 'http://services.odata.org/V4/(S(readwrite))/OData/OData.svc/' })
      .then(function(response) {
        var body = JSON.parse(response.body);
        var r = /(.*)\$metadata/.exec(body['@odata.context']);
        if(r) {
          config = {
            service: r[1],
            format: 'json'
          };
        }
      })
      .finally(done);
  });

  beforeEach(function() {
    q = Odata(config);
  });

  it('should retrieve price for item ID 6', function(done) {
    q.resource('Products', 6).select('Price').get()
      .then(function(response) {
        var body = JSON.parse(response.body);
        expect(body.Price).toEqual(18.8);
      })
      .catch(function(err) {
        fail(err);
      })
      .finally(done);
  });

  it('should change price for item ID 6', function(done) {
    q.resource('Products', 6).patch({'@odata.type': 'ODataDemo.Product', Price: 20.0}).
      then(function(response) {
        expect(response.statusCode).toEqual(204);
        q = Odata(config);
        return q.resource('Products', 6).get();
      })
      .then(function(response) {
        var body = JSON.parse(response.body);
        expect(body.Price).toEqual(20.0);
      })
      .catch(function(err) {
        fail(err);
      })
      .finally(done);
  });

  it('should change price for items 4 and 5 using a batch', function(done) {
    q.batch()
      .resource('Products', 4).patch({'@odata.type': 'ODataDemo.Product', Price: 14.4}, {content_id: 1})
      .resource('Products', 5).patch({'@odata.type': 'ODataDemo.Product', Price: 23.2}, {content_id: 2});
    q.send()
      .then(function(response) {
        q = Odata(config);
        return q.resource('Products', 4).select('Price').get()
      })
      .then(function(response) {
        var body = JSON.parse(response.body);
        expect(body.Price).toEqual(14.4);
        q = Odata(config);
        return q.resource('Products', 5).select('Price').get()
      })
      .then(function(response) {
        var body = JSON.parse(response.body);
        expect(body.Price).toEqual(23.2);
      })
      .catch(function(err) {
        fail(err);
      })
        .finally(done);
  });

  it('should post a new product', function(done) {
    q.resource('Products').post({
      "@odata.type":"#ODataDemo.FeaturedProduct",
      ID: 100,
      Name: 'Milk',
      Description: 'Cow juice',
      ReleaseDate: '2017-12-28',
      DiscontinuedDate: null,
      Rating: 1,
      Price: 1.20
    })
      .then(function(response) {
        q = Odata(config);
        return q.resource('Products', 100).get();
      })
      .then(function(response) {
        expect(response.statusCode).toEqual(200);
        let json = JSON.parse(response.body);
        expect(json.Name).toEqual('Milk');
        expect(json.Description).toEqual('Cow juice');
      })
      .catch(fail)
      .finally(done);
  });

});

