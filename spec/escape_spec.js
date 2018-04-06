'use strict';

const escape = require('../escape');
const identifier = require('../identifier');
const exact = require('../exact');

describe('escape value tests', function() {
  
  it('should escape \'string\'', function() {
    expect(escape('string')).toEqual('\'string\'');
  });

  it('should escape 5', function() {
    expect(escape(5)).toEqual('5');
  });

  it('should escape 3.1', function() {
    expect(escape(3.1)).toEqual('3.1');
  });

  it('should escape null', function() {
    expect(escape(null)).toEqual('null');
  });

  it('should escape [1,\'2\']', function() {
    expect(escape([1,'2'])).toEqual('[1,\'2\']');
  });

  it('should escape {a:\'text\',b:5}', function() {
    expect(escape({a:'text',b:5})).toEqual('{a:\'text\',b:5}');
  });

  it('should escape {a:\'\\\'text\\\'\',b:{c:6,d:\'\\\'string\\\'\'}}', function() {
    expect(escape({a:'\'text\'',b:{c:6,d:'\'string\''}})).toEqual('{a:\'\'\'text\'\'\',b:{c:6,d:\'\'\'string\'\'\'}}');
  });

  it('should escape identifier(\'a\')', function() {
    expect(escape(new identifier('a'))).toEqual('a');
  });

  it('should not escape exact(\'a\')', () => {
    expect(escape(new exact('a'))).toEqual('a');
  });

  it('should not escape exact(\'a\\\'\')', () => {
    expect(escape(new exact('a\''))).toEqual('a\'');
  });

  it('should escape date', () => {
    expect(escape(new Date(Date.UTC(2017,9,20)))).toEqual('2017-10-20T00:00:00.000Z');
  });

});

