var Physics = {
  checkForBorderCollision: function(target, xLimit, yLimit) {
    Physics.onBorderHit(target.x, target.radius, xLimit, function() {
      target.velocity.x *= -1;
      target.x = target.x < target.radius ? target.radius : xLimit - target.radius;
    });

    Physics.onBorderHit(target.y, target.radius, yLimit, function() {
      target.velocity.y *= -1;
      target.y = target.y < target.radius ? target.radius : yLimit - target.radius;
    });
  },

  onBorderHit: function(coord, radius, limit, callback) {
    if (coord < radius || coord > limit - radius) callback();
  },

  checkForCollision: function(first, second) {
    Physics.onCollision(first, second, function(first, second) {
      Physics.pushOut(first, second);
      Physics.updateVelocities(first, second);
    });
  },

  updateVelocities: function(first, second) {
    var normalAxis       = Vector.byPoints(first, second),
        firstNormal      = Vector.project(first.velocity, normalAxis),
        secondNormal     = Vector.project(second.velocity, normalAxis),
        tangentialAxis   = Vector.orthogonal(normalAxis),
        firstTangential  = Vector.project(first.velocity, tangentialAxis),
        secondTangential = Vector.project(second.velocity, tangentialAxis);

    first.velocity  = Vector.sum(firstTangential, secondNormal);
    second.velocity = Vector.sum(secondTangential, firstNormal);
  },

  onCollision: function(first, second, callback) {
    if (first.radius == 0 || second.radius == 0) return;

    var currentDistance = Vector.length(Vector.byPoints(first, second)),
        allowedDistance = first.radius + second.radius;
    
    if (currentDistance < allowedDistance) callback(first, second);
  },

  pushOut: function(first, second) {
    var xDiff           = first.x - second.x,
        yDiff           = first.y - second.y,
        currentDistance = Vector.length(Vector.byPoints(first, second)),
        allowedDistance = first.radius + second.radius,
        multipler       = (currentDistance - allowedDistance) / (2 * currentDistance);
        xOffset         = xDiff * multipler,
        yOffset         = yDiff * multipler;

    first.x  -= xOffset;
    first.y  -= yOffset;
    second.x += xOffset;
    second.y += yOffset;
  }
}