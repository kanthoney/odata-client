'use strict';

const Odata = require('../index');

const config = {
  service: 'https://example.com',
  resources: 'Customers'
};

describe('batch binary tests', function () {

  let odata;
  beforeEach(function () {
    odata = Odata(config).batch();
  });

  it('should calculate body length', function () {
    let buff = "";
    for (let i = 0; i < 256; ++i) buff += String.fromCharCode(i);
    odata.post(buff, {headers: {'Content-Type': 'application/octet-stream'}});
    const contentLength = /\r\nContent-Length: ([0-9]+)\r\n/.exec(odata.body())[1];
    expect(contentLength).toEqual('384');
  });

  it('should use buffer', () => {
    let buff = Buffer.alloc ? Buffer.alloc(256) : new Buffer(256);
    for(let i = 0; i < buff.length; i++) {
      buff[i] = i;
    }
    odata.post(buff, { headers: {'Content-Type': 'application/octet-stream'}});
    let bodyBatch = odata._batch.body();
    let body = odata.body();
    expect(typeof body).toEqual('string');
    expect(Buffer.isBuffer(bodyBatch)).toBeTruthy();
  });

});

