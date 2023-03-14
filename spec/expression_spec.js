'use strict';

const Expression = require('../expression');

describe('expression tests', function() {
  
  var e1, e2, e3, e4, e5, e6;

  it('should set e1 to a eq \'b\'', function() {
    e1 = new Expression('a eq \'b\'');
    expect(e1.toString()).toEqual('a eq \'b\'');
    e1 = new Expression('a', 'eq', 'b');
    expect(e1.toString()).toEqual('a eq \'b\'');
  });

  it('should set e2 to b add 2', function() {
    e2 = new Expression('b', '+', 2);
    expect(e2.toString()).toEqual('b add 2');
  });

  it('should set e3 to 5', function() {
    e3 = new Expression(5);
    expect(e3.toString()).toEqual('5');
  });

  it('should set e4 to c lt 6', function() {
    e4 = new Expression('c', 'lt', 6);
    expect(e4.toString()).toEqual('c lt 6');
  });

  it('should express e2 = e3', function() {
    expect(new Expression(e2, '=', e3).toString()).toEqual('(b add 2) eq (5)');
  });

  it('should express e2 = e3, method 2', function() {
    expect(new Expression(e2, e3).toString()).toEqual('(b add 2) eq (5)');
  });

  it('should express e2 != e3', function() {
    expect(new Expression(e2, '!=', e3).toString()).toEqual('(b add 2) ne (5)');
  });

  it('should express e2 < e3', function() {
    expect(new Expression(e2, '<', e3).toString()).toEqual('(b add 2) lt (5)');
  });

  it('should express e2 > e3', function() {
    expect(new Expression(e2, '>', e3).toString()).toEqual('(b add 2) gt (5)');
  });

  it('should express e2 <= e3', function() {
    expect(new Expression(e2, '<=', e3).toString()).toEqual('(b add 2) le (5)');
  });

  it('should express e2 >= e3', function() {
    expect(new Expression(e2, '>=', e3).toString()).toEqual('(b add 2) ge (5)');
  });

  it('should express e2 eq e3', function() {
    expect(new Expression(e2, 'eq', e3).toString()).toEqual('(b add 2) eq (5)');
  });

  it('should express e2 ne e3', function() {
    expect(new Expression(e2, 'ne', e3).toString()).toEqual('(b add 2) ne (5)');
  });

  it('should express e2 lt e3', function() {
    expect(new Expression(e2, 'lt', e3).toString()).toEqual('(b add 2) lt (5)');
  });

  it('should express e2 gt e3', function() {
    expect(new Expression(e2, 'gt', e3).toString()).toEqual('(b add 2) gt (5)');
  });

  it('should express e2 le e3', function() {
    expect(new Expression(e2, 'le', e3).toString()).toEqual('(b add 2) le (5)');
  });

  it('should express e2 ge e3', function() {
    expect(new Expression(e2, 'ge', e3).toString()).toEqual('(b add 2) ge (5)');
  });

  it('should express e2 + e3', function() {
    expect(new Expression(e2, '+', e3).toString()).toEqual('(b add 2) add (5)');
  });

  it('should express e2 - e3', function() {
    expect(new Expression(e2, '-', e3).toString()).toEqual('(b add 2) sub (5)');
  });

  it('should express e2 * e3', function() {
    expect(new Expression(e2, '*', e3).toString()).toEqual('(b add 2) mul (5)');
  });

  it('should express e2 / e3', function() {
    expect(new Expression(e2, '/', e3).toString()).toEqual('(b add 2) div (5)');
  });

  it('should express e2 % e3', function() {
    expect(new Expression(e2, '%', e3).toString()).toEqual('(b add 2) mod (5)');
  });

  it('should express e2 add e3', function() {
    expect(new Expression(e2, 'add', e3).toString()).toEqual('(b add 2) add (5)');
  });

  it('should express e2 sub e3', function() {
    expect(new Expression(e2, 'sub', e3).toString()).toEqual('(b add 2) sub (5)');
  });

  it('should express e2 mul e3', function() {
    expect(new Expression(e2, 'mul', e3).toString()).toEqual('(b add 2) mul (5)');
  });

  it('should express e2 div e3', function() {
    expect(new Expression(e2, 'div', e3).toString()).toEqual('(b add 2) div (5)');
  });

  it('should express e2 mod e3', function() {
    expect(new Expression(e2, 'mod', e3).toString()).toEqual('(b add 2) mod (5)');
  });

  it('should express e5 ne {a:6, b:\'c\'}', function() {
    e5 = new Expression({a:6, b:'c'});
    expect(e5.toString()).toEqual('{a:6,b:\'c\'}');
  });

  it('should express e6 = [6, \'s\']', function() {
    e6 = new Expression([6, 's']);
    expect(e6.toString()).toEqual('[6,\'s\']');
  });

  it('should create a complex expression', () => {
    let items = [
      { key1: 'abc', key2: '123' },
      { key1: 'def', key2: '456' },
      { key1: 'ghi' },
      {}
    ];
    expect(new Expression().or(
      items.map(item => {
        return new Expression().and(Object.keys(item).map(k => {
          return new Expression(k, '=', item[k]);
        }));
      })).toString()).toBe(
        "((key1 eq 'abc' and key2 eq '123') or (key1 eq 'def' and key2 eq '456') or (key1 eq 'ghi'))"
      );
  });

  it('should create an empty expression', () => {
    let items = [];
    expect(items.reduce((acc, item) => {
      return acc.or(Object.keys(item).reduce((acc, k) => {
        return acc.and(k, '=', item[k]);
      }, new Expression()));
    }, new Expression()).toString()).toBe("");
  });

});

