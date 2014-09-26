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
      count:  options.count  || 10,
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
      Dots.collide(dots, options);
      Dots.move(dots);
      Dots.refresh(context, dots, options);
      layout.resume();
    }
  },

  collide: function(dots, options) {
    var quadtree = d3.geom.quadtree(dots);
    dots.forEach(function(dot) { quadtree.visit(Dots.collideOne(dot, options)) });
  },

  refresh: function(context, dots, options) {
    context.clearRect(0, 0, options.width, options.height);
    context.fillStyle = "steelblue";
    context.beginPath();
    dots.forEach(function(dot) {
      context.moveTo(dot.x, dot.y);
      context.arc(dot.x, dot.y, options.radius, 0, 2 * Math.PI);
    });
    context.fill();
  },

  move: function(dots) {
    dots.forEach(function(dot) {
      dot.x += dot.velocity.x;
      dot.y += dot.velocity.y;
    });
  },

  // The following functions will be refactored

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

  collideOne: function(node, options) {
    var horizontalHit = (node.y < 0) || (node.y > options.height); 
    var verticalHit = (node.x < 0) || (node.x > options.width);

    if (verticalHit) {
      node.velocity.x *= -1;
      if (node.x < 0) {
        node.x = 0;
      } else {
        node.x = options.width;
      }
    } else {
      if (horizontalHit) {
        node.velocity.y *= -1;
        if (node.y < 0) {
          node.y = 0;
        } else {
          node.y = options.height;
        }
      }
    }

    var r = options.radius,
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