'use strict';

const odata = require('../index');

describe("Type tests", () => {

  it("should create a duration clause", () => {
    let q = odata({ service: 'http://example.com' });
    expect(q.filter('DurationValue', odata.type('duration', 'P12DT23H59M59.999999999999S')).query())
      .toBe('http://example.com/?%24filter=DurationValue%20eq%20duration\'P12DT23H59M59.999999999999S\'');
  });
  
});

