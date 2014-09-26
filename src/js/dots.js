var width = 960,
    height = 500;

var nodes = d3.range(100).map(
  function() { 
    return {
      radius: 20,
      velocity: { 
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1
      }
    }; 
  });

// root = nodes[0];

// root.radius = 0;
// root.fixed = true;


var force = d3.layout.force()
  .gravity(0)
  .charge(function(d, i) { return 0 })
  .nodes(nodes)
  .size([width, height]);

force.start();

var canvas = d3.select("body").append("canvas")
  .attr("width", width)
  .attr("height", height);

var context = canvas.node().getContext("2d");

force.on("tick", function(e) {
  var q = d3.geom.quadtree(nodes),
    i,
    d,
    n = nodes.length;

  for (i = 1; i < n; ++i) q.visit(collide(nodes[i]));

  for (i = 1; i < n; ++i) {
    d = nodes[i];
    var horizontalHit = (d.y < 0) || (d.y > height); 
    var verticalHit = (d.x < 0) || (d.x > width);

    if (verticalHit) {
      d.velocity.x *= -1;
      if (d.x < 0) {
        d.x = 5;
      } else {
        d.x = width - 5;
      }
    } else {
      if (horizontalHit) {
        d.velocity.y *= -1;
        if (d.y < 0) {
          d.y = 5;
        } else {
          d.y = height - 5;
        }
      }
    }
  }

  context.clearRect(0, 0, width, height);
  context.fillStyle = "steelblue";
  context.beginPath();
  for (i = 1; i < n; ++i) {
    d = nodes[i];
    d.x += d.velocity.x;
    d.y += d.velocity.y;
    context.moveTo(d.x, d.y);
    context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
  }
  context.fill();
  force.resume();
});

// canvas.on("mousemove", function() {
//   var p1 = d3.mouse(this);
//   root.px = p1[0];
//   root.py = p1[1];
//   force.resume();
// });

function updateSpeeds(first, second) {
  var normalVector = Vector.byPoints(first, second),
      firstNormalProjection = Vector.project(first.velocity, normalVector),
      secondNormalProjection = Vector.project(second.velocity, normalVector),
      tangentialVector = Vector.orthogonal(normalVector),
      firstTangentialProjection = Vector.project(first.velocity, tangentialVector),
      secondTangentialProjection = Vector.project(second.velocity, tangentialVector);

  first.velocity = Vector.sum(firstTangentialProjection, secondNormalProjection);
  second.velocity = Vector.sum(secondTangentialProjection, firstNormalProjection);
}

function collide(node) {
  // So we calculate borders of rectangle, covering this node
  var r = node.radius + 20,
  nx1 = node.x - r,
  nx2 = node.x + r,
  ny1 = node.y - r,
  ny2 = node.y + r;

  // Then we create a function, which accepts a quad, and it's rectangular coordinates?
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      // Then we calculate difference in X
      var x = node.x - quad.point.x,
      // Then in Y
      y = node.y - quad.point.y,
      // Then we calculate distance between their centers.
      l = Math.sqrt(x * x + y * y),
      // Then we calculate minimum non-collision distance
      r = node.radius + quad.point.radius;
      // If we actually 'collided', meaning that centers are closer than they should be...
      if (l < r) {
        l = (l - r) / l * .5;
        // We push both nodes out of each other by the same values.
        // That's actually the perfect place to strike with ... velocity change mechanism.
        // updateSpeeds(node, quad.point);

        updateSpeeds(node, quad.point);
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    // And here comes the optimization:
    // True if children of that node is not visited
    // False if visited
    // I understand it like: True -> fuck traversing.
    //                       False -> continue traversing.
    // If there is no point->False.

    // So, if quad is in boundaries... continue traversing.
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}