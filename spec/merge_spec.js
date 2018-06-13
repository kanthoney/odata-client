'use strict';

const odata = require('../index');
const request = require('../request');


const config = {
  version: '2.0',
  headers: {Accept: 'application/json'}
};

describe('Merge (ODATA v2) tests', function () {

  it('should merge a product', function (done) {

    request({
      uri: 'http://services.odata.org/V2/(S(readwrite))/OData/OData.svc',
      followRedirect: false
    }, function (err, response) {

      var q = function () {
        return odata(Object.assign({service: 'http://services.odata.org' + response.headers.location}, config));
      };
      var productId;

      // get every products
      q().resource('Products')
        .get()
        .then(function (res) {
          expect(res.statusCode).toEqual(200);
          productId = JSON.parse(res.body).d[0].ID;

          // update the first product
          return q().resource('Products', productId)
            .merge({Name: 'Updated Bread'});
        })
        .then(function (res) {
          expect(res.statusCode).toEqual(204);

          // get the updated product
          return q().resource('Products', productId).get()
        })
        .then(function (res) {
          expect(res.statusCode).toEqual(200);
          var updatedProduct = JSON.parse(res.body).d;
          expect(updatedProduct.Name).toEqual('Updated Bread');
        })
        .catch(function (err) {
          fail(err);
        })
        .finally(done);
    });

  });

});