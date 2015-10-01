var fs = require('fs');
var path = require('path');

function loadGraph(number, callback) {
  var file = path.join(__dirname, './graphs/stellardata_'+number+'.json');
  fs.readFile(file, 'utf8', function(err, data) {
    stars = JSON.parse(data).stars;
    end = JSON.parse(data).endPoint;
    callback(stars, end);
  });
}

module.exports = {
  loadGraph: loadGraph
}
