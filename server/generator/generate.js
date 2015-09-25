var fs = require('fs');
var algo = require('../algo');

var types = ['carbon', 'helium', 'hydrogen', 'oxygen', 'nitrogen'];

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

function generateStars(n) {
  var stars = [];
  for (var i = 0; i < n; i++) {
    var s = {};
    stars.push(s);
  }
  stars.forEach(function(s, i) {
    s._id = i;
    var p = {}; p.x = Math.floor(Math.random()*500); p.y = Math.floor(Math.random()*500); p.z = Math.floor(Math.random()*500); s.position = p;
  });

  stars.forEach(function(s) {
    s.resource = {
      type: types[Math.floor(Math.random() * 5)],
      amount: Math.floor(Math.random() * (n/10))
    }
  });

  stars.forEach(function(s) {
    s.direction = {
      x: Math.floor(Math.random() * 20) - 10,
      y: Math.floor(Math.random() * 20) - 10,
      z: Math.floor(Math.random() * 20) - 10
    }
  });

  return stars;
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

var stars = generateStars(1000);

var answ = calcDistDijkstra(stars, stars[0]);
var farAway = answ.reduce(function(prev, cur, idx, arr) {
  if (cur.dist > prev.dist && cur.dist !== Number.MAX_VALUE) {
    return cur;
  } else {
    return prev;
  }
}, answ[0]);

var scenario = {};
scenario.stars = stars;
scenario.start = stars[0];
scenario.end = farAway;
scenario.resources = 500;

var filename = process.argv.slice(2)[0];
fs.writeFile(filename, JSON.stringify(scenario));

/**
* Generates the graph according to given parameters.
* @param {number} n - The amount of vertices.
* @param {boolean} materials - Are materials included?
* @param {boolean} direction - Are vertices given a direction vector?
* @param {string=} filename - Optional: Exports the generated graph as json with the given name.
* @returns {Array} - The generated graph.
*/
function generateGraph(n, materials, direction, filename) {

}

function generatePosition(v) {

}

module.exports = {
  generateGraph: generateGraph
}
