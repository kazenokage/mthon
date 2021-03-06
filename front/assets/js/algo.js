// Mthon 2015
// Algorithm template
// www.solinor.fi

var MTHONALGO = MTHONALGO || {};

// required base function for finding the path in <dataset>
MTHONALGO.solveStellarRoute = function(dataset) {
    var solution = {
      // path consists of id:s of the stars in the path, in linear order start->end
      // example: [23,654,234,2,64]
      path: [],
      // connections consits of individual connections between stars, identified by pairs of star ids
      // example: [[1,56],[38,62]]
      connections: [],
      // length of the path
      length: 0
    };

    function getStar(id, stars) {
      var ret = stars.filter(function (s) {
        return s._id === id;
      });
      return ret.length > 0 ? ret[0] : undefined;
    }

    function dist(x1, y1, z1, x2, y2, z2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    }

    function distStars(s1, s2) {
      return dist(s1.position.x, s1.position.y, s1.position.z, s2.position.x, s2.position.y, s2.position.z);
    }

    function findPathBetween(graph, source, target) {
      var tar = getStar(target, graph);
      var solved = calcDistDijkstra(graph, source);
      return getPath(tar);
    }

    function calcDistance(path, stars, res) {
      if (res) {
        resources = {};
        ['carbon', 'helium', 'hydrogen', 'oxygen', 'nitrogen'].forEach(function (r) {
          resources[r] = 0;
        });
      }

      var d = 0;
      for (var i = 0; i < path.length - 1; i++) {
        var currentStar = getStar(path[i], stars);
        var nextStar = getStar(path[i + 1], stars);
        var distance = distStars(currentStar, nextStar);
        d += distance;
      }
      return d;
    }

    function calcRes(star, resources) {
      resources[star.resource.type] += star.resource.amount;
    }

    function constructNeighbors(graph) {
      graph.forEach(function (star) {
        star.nghbrs = graph.filter(function (pn) {
          return distStars(star, pn) <= 30 && pn !== star;
        }).map(function (n) {
          return n._id;
        });
      });
      return graph;
    }

    function calcDistDijkstra(graph, source) {
      constructNeighbors(graph);

      function relax(u, v) {
        if (v.dist > u.dist + distStars(u, v)) {
          v.dist = u.dist + distStars(u, v);
          v.par = u;
        }
      }

      function getCheapest(q) {
        return q.reduce(function (prev, cur) {
          return prev.dist > cur.dist ? cur : prev;
        }, q[0]);
      }

      source.dist = 0;
      var q = [];
      var s = [];

      graph.forEach(function (v) {
        if (v !== source) {
          v.dist = Number.MAX_VALUE;
          v.par = undefined;
        }
        q.push(v);
      });

      while (q.length > 0) {
        var cur = getCheapest(q);
        q = q.filter(function (n) {
          return n !== cur;
        });
        s.push(cur);
        cur.nghbrs.forEach(function (n) {
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

    function findFurthest(graph) {
      var completedGraph = calcDistDijkstra(graph, graph[0]);
      var furthest = completedGraph.reduce(function (prev, cur, idx, arr) {
        if (cur.dist > prev.dist && cur.dist !== Number.MAX_VALUE) {
          return cur;
        } else {
          return prev;
        }
      }, completedGraph[0]);
      return furthest;
    }

    solution.path = findPathBetween(dataset.stars, dataset.stars[0], dataset.endPoint);
    dataset.stars.forEach(function(s) {
      s.nghbrs.forEach(function(n) {
        solution.connections.push([s._id, n]);
      });
    });

    // do your magic here

    // required return
    return solution;
}

// add your support functions in here
