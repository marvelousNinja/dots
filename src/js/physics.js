var Physics = {
  checkForBorderCollision: function(dot, options) {
    var horizontalHit = (dot.y < options.radius) || (dot.y > options.height - options.radius); 
    var verticalHit = (dot.x < options.radius) || (dot.x > options.width - options.radius);

    if (verticalHit) {
      dot.velocity.x *= -1;
      if (dot.x < options.radius) {
        dot.x = options.radius;
      } else {
        dot.x = options.width - options.radius;
      }
    } else {
      if (horizontalHit) {
        dot.velocity.y *= -1;
        if (dot.y < options.radius) {
          dot.y = options.radius;
        } else {
          dot.y = options.height - options.radius;
        }
      }
    }
  },

  checkForCollision: function(first, second, options) {
    Physics.onIntersection(first, second, options, function(first, second, xDiff, yDiff, currentDistance, allowedDistance) {
      Physics.speedsAfterCollision(first, second);
      Physics.pushOut(first, second, xDiff, yDiff, currentDistance, allowedDistance);
    });
  },

  speedsAfterCollision: function(first, second) {
    var normalVector               = Vector.byPoints(first, second),
        firstNormalProjection      = Vector.project(first.velocity, normalVector),
        secondNormalProjection     = Vector.project(second.velocity, normalVector),
        tangentialVector           = Vector.orthogonal(normalVector),
        firstTangentialProjection  = Vector.project(first.velocity, tangentialVector),
        secondTangentialProjection = Vector.project(second.velocity, tangentialVector);

    first.velocity = Vector.sum(firstTangentialProjection, secondNormalProjection);
    second.velocity = Vector.sum(secondTangentialProjection, firstNormalProjection);
  },

  onIntersection: function(first, second, options, callback) {
    var xDiff = first.x - second.x,
        yDiff = first.y - second.y,
        currentDistance = Vector.length({ x: xDiff, y: yDiff }),
        allowedDistance = options.radius * 2;
    
    if (currentDistance < allowedDistance) {
      return callback(first, second, xDiff, yDiff, currentDistance, allowedDistance);
    }
  },

  pushOut: function(first, second, xDiff, yDiff, currentDistance, allowedDistance) {
    var multipler = (currentDistance - allowedDistance) / (2 * currentDistance),
        xOut = xDiff * multipler,
        yOut = yDiff * multipler;
    
    first.x -= xOut;
    first.y -= yOut;
    second.x += xOut;
    second.y += yOut;
  }
}