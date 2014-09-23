// Da plan.

// 1. Let us think about incoming parameters...
// 2. Bounding box.
// 3. Collisions.
// 4. Nicey dicey!
// 5.
// Algorithm:
// 1. Handle collisions.
//    a) Border.
//    b) Other particles.
// 2. Handle velocity changes.
// 3. What about 'runs away from cursor?'


var width = 960,
    height = 500;

var nodes = d3.range(200).map(
  function() { 
    return {
      radius: 10,
      velocity: { 
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1
      }
    }; 
  }),
root = nodes[0];

root.radius = 0;
root.fixed = true;


var force = d3.layout.force()
  .gravity(0)
  .charge(function(d, i) { return i ? 0 : -1000; })
  .nodes(nodes)
  .alpha(1000)
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

canvas.on("mousemove", function() {
  var p1 = d3.mouse(this);
  root.px = p1[0];
  root.py = p1[1];
  force.resume();
});

function collide(node) {
  var r = node.radius + 16,
  nx1 = node.x - r,
  nx2 = node.x + r,
  ny1 = node.y - r,
  ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
      y = node.y - quad.point.y,
      l = Math.sqrt(x * x + y * y),
      r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}