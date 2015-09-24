var fs = require('fs');

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

  stars.forEach(function(s) { s.nghbrs = stars.filter(function(pn) { return (distStars(s, pn) < 30 && s !== pn); }).map(function(ng) { return ng._id}); });
  return stars;
}

var stars = generateStars(10000);

fs.writeFile('stars', JSON.stringify(stars));
