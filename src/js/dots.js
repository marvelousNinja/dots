var Dots = {
  initialize: function(opts) {
    var options = Dots.setDefaults(opts),
        dots    = Dots.initializeDots(options),
        pointer = Dots.initializePointer(dots),
        layout  = Dots.initializeLayout(dots, options),
        canvas  = Dots.initializeCanvas(options),
        context = Dots.initializeContext(canvas);

    Dots.initializeLayoutHandlers(layout, context, dots, options);
    Dots.initializeMouseHandlers(canvas, pointer);
  },

  setDefaults: function(options) {
    if(!options) options = {};

    return {
      width:  options.width        || 900,
      height: options.height       || 500,
      count:  options.count        || 100,
      radius: options.radius       || 15,
      container: options.container || 'body'
    }
  },

  initializeDots: function(options) {
    return d3.range(options.count + 1).map(function() {
      return {
        velocity: {
          x: Math.random() - 0.5,
          y: Math.random() - 0.5
        },
        radius: options.radius,
        color: {
          red: 255,
          green: Math.random() * 255 | 0,
          blue: 0,
          animationDirection: 1
        }
      }
    });
  },

  initializePointer: function(dots) {
    var pointer = dots[0];
    pointer.fixed = true;
    return pointer;
  },

  initializeLayout: function(dots, options) {
    return d3.layout.force()
             .gravity(0)
             .charge(function(d, i) { return i == 0 ? -1000 : 0})
             .chargeDistance(350)
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

  initializeMouseHandlers: function(canvas, pointer) {
    canvas.on('mousemove', Dots.movePointerHandler(pointer));
  },

  movePointerHandler: function(pointer) {
    return function() {
      var point = d3.mouse(this);
      pointer.px = point[0];
      pointer.py = point[1];
    }
  },

  tickHandler: function(layout, context, dots, options) {
    return function() {
      Dots.refresh(context, dots, options);
      Dots.solveCollisions(dots, options);
      Dots.move(dots);
      Dots.updateColors(dots);

      layout.resume();
    }
  },

  solveCollisions: function(dots, options) {
    var quadtree = d3.geom.quadtree(dots);
    dots.forEach(function(dot) { quadtree.visit(Dots.solveCollisionsFor(dot, options)) });
  },

  refresh: function(context, dots, options) {
    context.clearRect(0, 0, options.width, options.height);
  
    dots.forEach(function(dot) {
      if (dot.fixed) return;
      context.beginPath();
      context.fillStyle = Dots.rgbColor(dot.color);
      context.moveTo(dot.x, dot.y);
      context.arc(dot.x, dot.y, dot.radius, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    });
  },

  rgbColor: function(color) {
    return 'rgb(' + color.red + ',' + color.green + ',' + color.blue + ')';
  },

  updateColors: function(dots) {
    dots.forEach(function(dot) {
      var color = dot.color;

      color.green = color.green + color.animationDirection * ((Math.random() + 0.5)) * 10 | 0;

      if (color.green < 0 || color.green > 255) {
        color.animationDirection *= -1;
        color.green = color.green > 255 ? 255 : 0;
      }
    });
  },

  move: function(dots) {
    dots.forEach(function(dot) {
      if (dot.fixed) return;
      dot.x += dot.velocity.x;
      dot.y += dot.velocity.y;
    });
  },

  solveCollisionsFor: function(dot, options) {
    if(!dot.fixed) {
      Physics.checkForBorderCollision(dot, options.width, options.height);
    }

    var nx1 = dot.x - dot.radius,
        nx2 = dot.x + dot.radius,
        ny1 = dot.y - dot.radius,
        ny2 = dot.y + dot.radius;

    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== dot)) {
        if (!dot.fixed && !quad.point.fixed) {
          Physics.checkForCollision(dot, quad.point);
        }
      }

      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }
}