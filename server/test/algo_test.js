'use strict';

var assert = require('assert');
var algo = require('../algo');

describe('The base algorithm', () => {
  describe('#constructNeighbors()', () => {
    it('should construct neighbors correctly', () => {
      var graph = [{
        _id: 0,
        position: {
          x: 1,
          y: 1,
          z: 1
        }
      }, {
        _id: 1,
        position: {
          x: 2,
          y: 2,
          z: 2
        }
      }, {
        _id: 2,
        position: {
          x: 3,
          y: 3,
          z: 3,
        }
      }, {
        _id: 3,
        position: {
          x: 50,
          y: 50,
          z: 50
        }
      }];
      algo.constructNeighbors(graph);
      assert.deepEqual([1,2], graph[0].nghbrs);
      assert.deepEqual([], graph[3].nghbrs);
    });
  });
});
