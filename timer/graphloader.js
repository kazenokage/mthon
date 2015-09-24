var fs = require('fs');
var path = require('path');

function loadGraph(number, callback) {
  var file = path.join(__dirname, './graphs/stellardata_'+number+'.json');
  fs.readFile(file, 'utf8', function(err, data) {
    stars = JSON.parse(data).stars;
    callback(stars);
  });
}

module.exports = {
  loadGraph: loadGraph
}
