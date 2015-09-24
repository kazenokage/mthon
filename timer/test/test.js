var assert = require('assert');
var algo = require('../algo');
var graphloader = require('../graphloader');

describe('Shortest path', function() {
  describe('with graph 1', function () {
    it('return the correct path', function () {
      graphloader.loadGraph(1, function(stars) {
        var goal = stars.filter(function(s) { return s._id === 167 })[0];
        var ret = algo.algo(stars, stars[0], goal);
        assert.equal([ 2, 61, 623, 446, 610, 580, 182, 117, 660, 559, 167 ], ret);
      });
    });
  });
});
