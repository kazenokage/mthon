var graphloader = require('./graphloader');
var algo = require('./algo');

graphloader.loadGraph(2, function(stars) {
  var answ = calcDistDijkstra(stars, stars[0]);
  var farAway = answ.reduce(function(prev, cur, idx, arr) {
    if (cur.dist > prev.dist && cur.dist !== Number.MAX_VALUE) {
      return cur;
    } else {
      return prev;
    }
  }, answ[0]);
  console.log(farAway);
});

function getStar(id, stars) {
  var ret = stars.filter(function(s) { return s._id === id });
  return ret.length > 0 ? ret[0] : undefined;
}

function dist(x1,y1,z1,x2,y2,z2) {
  return Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1, 2) + Math.pow(z2-z1,2));
}
function distStars(s1, s2) {
  return dist(s1.position.x, s1.position.y, s1.position.z, s2.position.x, s2.position.y, s2.position.z);
}

function calcDistDijkstra(graph, source, target) {

  function relax(u, v) {
    if (v.dist > u.dist + distStars(u, v)) {
      v.dist = u.dist + distStars(u, v);
      v.par = u;
    }
  }

  function getCheapest(q) {
    return q.reduce(function(prev, cur, idx, arr) {
      if (prev.dist > cur.dist) {
        return cur;
      } else {
        return prev;
      }
    }, q[0]);
  }

  source.dist = 0;
  var q = [];
  var s = [];

  graph.forEach(function(v) {
    if (v !== source) {
      v.dist = Number.MAX_VALUE;
      v.par = undefined;
    }
    q.push(v);
  });

  while (q.length > 0) {
    var cur = getCheapest(q);
    q = q.filter(function(n) {
      return n !== cur;
    });
    s.push(cur);
    cur.nghbrs.forEach(function(n) {
      relax(cur, getStar(n, graph));
    });
  }

  return s;
}
