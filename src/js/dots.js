var Dots = {
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
    return function() {
      Dots.solveCollisions(dots, options);
      Dots.move(dots);
      Dots.refresh(context, dots, options);
      layout.resume();
    }
  },

  solveCollisions: function(dots, options) {
    var quadtree = d3.geom.quadtree(dots);
    dots.forEach(function(dot) { quadtree.visit(Dots.collisionsFor(dot, options)) });
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

  collisionsFor: function(dot, options) {
    Physics.checkForBorderCollision(dot, options);
    var nx1 = dot.x - options.radius,
        nx2 = dot.x + options.radius,
        ny1 = dot.y - options.radius,
        ny2 = dot.y + options.radius;

    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== dot)) {
        Physics.checkForCollision(dot, quad.point, options);
      }

      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }
}