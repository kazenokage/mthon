
  // scene setup
  var scene = new THREE.Scene();
  //´scene.fog = new THREE.Fog(0x110329, 180, 350);

  // camera setup
  var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.up.set( 1, 0, 0 );

  // renderer setup
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // define materials & textures
  var starspritemap = THREE.ImageUtils.loadTexture("assets/js/glow.png");
  var startMaterial = new THREE.SpriteMaterial( { map: THREE.ImageUtils.loadTexture("assets/js/pointer-start.png"), blending: THREE.AdditiveBlending } );
  var endMaterial = new THREE.SpriteMaterial( { map: THREE.ImageUtils.loadTexture("assets/js/pointer-end.png"), blending: THREE.AdditiveBlending } );

  var starSprites = {};

  // draw the stars
  for (var i = 0; i < stellarobjects.stars.length; i++) {
    var material = new THREE.SpriteMaterial( { map: starspritemap, color: planetarycolor.color[stellarobjects.stars[i].type - 1].hex, fog: true, blending: THREE.AdditiveBlending } );
    var sprite = new THREE.Sprite( material );
    sprite.position.set(stellarobjects.stars[i].position.x,stellarobjects.stars[i].position.y,stellarobjects.stars[i].position.z)
    sprite.scale.x = sprite.scale.y = stellarobjects.stars[i].size;
    scene.add( sprite );
    starSprites[stellarobjects.stars[i]._id] = sprite;
  }

  var pos = stellarobjects.stars[0].position;
  var pos2 = stellarobjects.stars[1].position;
  var material = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });

  function dist(x1,y1,z1,x2,y2,z2) {
    return Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1, 2) + Math.pow(z2-z1,2));
  }
  function distStars(s1, s2) {
    return dist(s1.position.x, s1.position.y, s1.position.z, s2.position.x, s2.position.y, s2.position.z);
  }
  // stellarobjects.stars.forEach(function(s) { s.nghbrs = reduced.filter(function(pn) { return distStars(s, pn) < 30; }});
  // stellarobjects.stars.forEach(function(s) { s.nghbrs = s.nghbrs.map(function(n) { return n._id }) });

  function getStar(id) {
    var ret = stellarobjects.stars.filter(function(s) { return s._id === id });
    return ret.length > 0 ? ret[0] : undefined;
  }

  stellarobjects.stars.forEach(function(s) {
    s.nghbrs.forEach(function(nId) {
      var nstar = getStar(nId);
      drawLineBetween(s, nstar, 0x291a41, 1);
    });
  });

  function drawLineBetween(first, second, color, width) {
    var color = color || 0xceadff;
    var width = width || 3
    var material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: width
    });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(first.position.x, first.position.y, first.position.z));
    geometry.vertices.push(new THREE.Vector3(second.position.x, second.position.y, second.position.z));
    var line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  // var path = [2, 10, 86, 432, 61, 93, 582, 623, 446, 696];

  // default zoom of camera

  camera.position.z = 120;

  // controls for camera

  controls = new THREE.OrbitControls( camera, renderer.domElement );

  var render = function () {
    renderPath();
    requestAnimationFrame( render );
    TWEEN.update();
    renderer.render(scene, camera);
  };

  var pidx = 0;
  var ctr = 0;
  function renderPath() {
    ctr++;
    if (ctr % 60 === 0 && pidx < path.length-1) {
      var first = getStar(path[pidx]);
      var second = getStar(path[pidx+1]);
      starSprites[first._id].scale.x = starSprites[first._id].scale.y = 5;
      starSprites[second._id].scale.x = starSprites[second._id].scale.y = 5;
      if (pidx === 0) {
        var startSprite = new THREE.Sprite( startMaterial );
        var endSprite = new THREE.Sprite( endMaterial );
        startSprite.position.set(getStar(path[0]).position.x,getStar(path[0]).position.y,getStar(path[0]).position.z)
        endSprite.position.set(getStar(path[path.length-1]).position.x,getStar(path[path.length-1]).position.y,getStar(path[path.length-1]).position.z)
        startSprite.scale.x = startSprite.scale.y = endSprite.scale.x = endSprite.scale.y = 8;
        scene.add( startSprite );
        scene.add( endSprite );
      }
      setTimeout(function() {
        drawLineBetween(first, second);
      }, 1000);
      pidx++;
      ctr = 0;
    }
    moveCamera(getStar(path[pidx]).position.x,getStar(path[pidx]).position.y,getStar(path[pidx]).position.z);
  }

  function calcDist(G, v) {
    G.forEach(function(n) {
      n.dist = Number.MAX_VALUE;
      n.par = undefined;
    });

    var q = [];

    v.dist = 0;
    q.push(v);

    while (q.length > 0) {
      var cur = q[0];
      q = q.slice(1);
      cur.nghbrs.forEach(function(nghbr) {
        var n = getStar(nghbr);
        if (n.dist === Number.MAX_VALUE) {
          n.dist = cur.dist + distStars(cur, n);
          n.par = cur;
          q.push(n);
        }
      });
    }
  }

  function calcDistDijkstra(graph, source) {

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

    //console.log(source);

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
        relax(cur, getStar(n));
      });
    }
  }

  calcDistDijkstra(stellarobjects.stars, stellarobjects.stars[0]);

  var farAway = stellarobjects.stars.reduce(function(prev, cur, idx, arr) {
    if (cur.dist > prev.dist && cur.dist !== Number.MAX_VALUE) {
      return cur;
    } else {
      return prev;
    }
  }, stellarobjects.stars[0]);

  console.log(farAway);

  var path = [];

  while (farAway.par) {
    path.push(farAway._id);
    farAway = farAway.par;
  }
  path.push(stellarobjects.stars[0]._id);

  var moveCamera = function(posx,posy,posz) {
    var timer = Date.now() * 0.00005;
    camera.position.x = Math.cos( timer ) * 120;
    camera.position.z = Math.sin( timer ) * 120;
    //camera.lookAt(new THREE.Vector3(posx,posy,posz));
    controls.center.set(posx, posy, posz);
    controls.update();
  }

  render();
