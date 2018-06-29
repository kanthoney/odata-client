'use strict';

const Odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

let buff = "";
for (let i = 0; i < 256; ++i) buff += String.fromCharCode(i);

describe('batch binary tests', function () {

  let odata;
  beforeEach(function () {
    odata = Odata(config).batch();
  });

  it('should calculate body length', function () {
    odata.post(buff, {headers: {'Content-Type': 'application/octet-stream'}});
    const contentLength = /\r\nContent-Length: ([0-9]+)\r\n/.exec(odata.body())[1];
    expect(contentLength).toEqual('384');
  });


});

