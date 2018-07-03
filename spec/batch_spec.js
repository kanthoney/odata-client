'use strict';

const Odata = require('../index');

const config = {
    service: 'https://example.com',
    resources: 'Customers'
};

describe('batch tests', function () {

    let odata;
    beforeEach(function () {
        odata = Odata(config).batch();
    });

    it('should contain only one Content-Type header by subrequest', function () {

        odata.post('<?xml version = "1.0" encoding="UTF-8" standalone="yes" ?><test></test>', {
            headers: { "Content-Type": "application/xml"}
        });

        odata.post('<html><header></header><body></body></html>', {
            headers: { "Content-Type": "text/html"}
        });

        let buff = Buffer.alloc ? Buffer.alloc(64) : new Buffer(64);
        for(let i = 0; i < buff.length; i++) {
            buff[i] = i;
        }
        odata.post(buff, { headers: {'Content-Type': 'application/octet-stream'}});

        const body = odata.body();
        expect((body.match(/Content-Type: *application\/xml/gi) || []).length).toEqual(1);
        expect((body.match(/Content-Type: *text\/html/gi) || []).length).toEqual(1);
        expect((body.match(/Content-Type: *application\/octet-stream/gi) || []).length).toEqual(1);
    });

});

