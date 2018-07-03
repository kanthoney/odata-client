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

  it('should base64 encode a buffer', () => {
    let buff = Buffer.alloc ? Buffer.alloc(64) : new Buffer(64);
    for(let i = 0; i < buff.length; i++) {
      buff[i] = i;
    }
    odata.post(buff, { headers: {'Content-Type': 'application/octet-stream'}});
    let body = odata.body();
    expect(/Content-Length: 90/g.test(body)).toBeTruthy();
    expect(/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0\+Pw==/g.test(body)).toBeTruthy();
  });

});

