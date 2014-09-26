Dots = {
  initialize: function(opts) {
    var options = Dots.setDefaults(opts),
        dots    = Dots.initializeDots(options),
        layout  = Dots.initializeLayout(dots, options),
        canvas  = Dots.initializeCanvas(options),
        context = Dots.initializeContext(canvas);

    Dots.initializeLayoutHandlers(layout, context, dots, options);
  },

  setDefaults: function(options) {
    if(!options) options = {};
    return {
      width:  options.width  || 900,
      height: options.height || 500,
      radius: options.radius || 20,
      count:  options.count  || 100,
      container: options.container || 'body'
    }
  },

  initializeDots: function(options) {
    return d3.range(options.count).map(function() {
      return {
        velocity: {
          x: Math.random() - 0.5,
          y: Math.random() - 0.5
        }
      }
    });
  },

  initializeLayout: function(dots, options) {
    return d3.layout.force()
             .gravity(0)
             .charge(0)
             .nodes(dots)
             .size([options.width, options.height])
             .start();
  },

  initializeCanvas: function(options) {
    return d3.select(options.container).append('canvas')
             .attr('width', options.width)
             .attr('height', options.height);
  },

  initializeContext: function(canvas) {
    return canvas.node().getContext("2d");
  },

  initializeLayoutHandlers: function(layout, context, dots, options) {
    layout.on('tick', Dots.tickHandler(layout, context, dots, options));
  },

  tickHandler: function(layout, context, dots, options) {
    return function(e) {
      var q = d3.geom.quadtree(dots),
          i,
          d,
          n = dots.length;

      for (i = 1; i < n; ++i) q.visit(Dots.collide(dots[i], options));

      for (i = 1; i < n; ++i) {
        d = dots[i];
        var horizontalHit = (d.y < 0) || (d.y > options.height); 
        var verticalHit = (d.x < 0) || (d.x > options.width);

        if (verticalHit) {
          d.velocity.x *= -1;
          if (d.x < 0) {
            d.x = 5;
          } else {
            d.x = options.width - 5;
          }
        } else {
          if (horizontalHit) {
            d.velocity.y *= -1;
            if (d.y < 0) {
              d.y = 5;
            } else {
              d.y = options.height - 5;
            }
          }
        }
      }

      context.clearRect(0, 0, options.width, options.height);
      context.fillStyle = "steelblue";
      context.beginPath();
      for (i = 1; i < n; ++i) {
        d = dots[i];
        d.x += d.velocity.x;
        d.y += d.velocity.y;
        context.moveTo(d.x, d.y);
        context.arc(d.x, d.y, options.radius, 0, 2 * Math.PI);
      }
      context.fill();
      layout.resume();
    }
  },

  updateSpeeds: function(first, second) {
    var normalVector = Vector.byPoints(first, second),
      firstNormalProjection = Vector.project(first.velocity, normalVector),
      secondNormalProjection = Vector.project(second.velocity, normalVector),
      tangentialVector = Vector.orthogonal(normalVector),
      firstTangentialProjection = Vector.project(first.velocity, tangentialVector),
      secondTangentialProjection = Vector.project(second.velocity, tangentialVector);

    first.velocity = Vector.sum(firstTangentialProjection, secondNormalProjection);
    second.velocity = Vector.sum(secondTangentialProjection, firstNormalProjection);
  },

  collide: function(node, options) {
    var r = options.radius + 20,
    nx1 = node.x - r,
    nx2 = node.x + r,
    ny1 = node.y - r,
    ny2 = node.y + r;

    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        var x = node.x - quad.point.x,
        y = node.y - quad.point.y,
        l = Math.sqrt(x * x + y * y),
        r = options.radius + options.radius
        if (l < r) {
          l = (l - r) / l * .5;
          Dots.updateSpeeds(node, quad.point);
          node.x -= x *= l;
          node.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }

      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }
}