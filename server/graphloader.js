var fs = require('fs');
var path = require('path');

function loadGraph(number, callback) {
  var file = path.join(__dirname, './graphs/stellardata_'+number+'.json');
  fs.readFile(file, 'utf8', function(err, data) {
    dataset = JSON.parse(data).dataset;
    callback(dataset);
  });
}

module.exports = {
  loadGraph: loadGraph
}
