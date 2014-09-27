var Physics = {
  checkForBorderCollision: function(dot, options) {
    var horizontalHit = (dot.y < dot.radius) || (dot.y > options.height - dot.radius); 
    var verticalHit = (dot.x < dot.radius) || (dot.x > options.width - dot.radius);

    if (verticalHit) {
      dot.velocity.x *= -1;
      if (dot.x < dot.radius) {
        dot.x = dot.radius;
      } else {
        dot.x = options.width - dot.radius;
      }
    }
    
    if (horizontalHit) {
      dot.velocity.y *= -1;
      if (dot.y < dot.radius) {
        dot.y = dot.radius;
      } else {
        dot.y = options.height - dot.radius;
      }
    }
  },

  checkForCollision: function(first, second, options) {
    Physics.onCollision(first, second, options, function(first, second, xDiff, yDiff, currentDistance, allowedDistance) {
      Physics.pushOut(first, second, xDiff, yDiff, currentDistance, allowedDistance);
      Physics.speedsAfterCollision(first, second);
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

  onCollision: function(first, second, options, callback) {
    var xDiff = first.x - second.x,
        yDiff = first.y - second.y,
        currentDistance = Vector.length({ x: xDiff, y: yDiff }),
        allowedDistance = first.radius + second.radius;
    
    if (currentDistance < allowedDistance) {
      callback(first, second, xDiff, yDiff, currentDistance, allowedDistance);
    }
  },

  pushOut: function(first, second, xDiff, yDiff, currentDistance, allowedDistance) {
    if (currentDistance < allowedDistance) {
      var multipler = (currentDistance - allowedDistance) / (2 * currentDistance),
          xOut = xDiff * multipler,
          yOut = yDiff * multipler;

      first.x -= xOut;
      first.y -= yOut;
      second.x += xOut;
      second.y += yOut;
    }
  }
}