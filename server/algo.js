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

function findPathBetween(graph, source, target) {
  var solved = calcDistDijkstra(graph, source);
  return getPath(target);
}

function calcDistDijkstra(graph, source) {
  graph.forEach(function(star) {
    star.nghbrs = graph.filter(function(pn) {
      return distStars(star, pn) <= 35 && pn !== star;
    })
    .map(function(n) { return n._id} );
  });

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

function getPath(end) {
  var ret = [];
  while (end.par) {
    ret.push(end._id);
    end = end.par;
  }
  ret.push(end._id);
  return ret.reverse();
}

module.exports = {
  algo: findPathBetween
}
