var Vector = {
  length: function(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  },

  scalarDot: function(first, second) {
    return first.x * second.x + first.y * second.y;
  },

  project: function(target, base) {
    if(Vector.isZero(target) || Vector.isZero(base)) return Vector.zero();

    var ratio = Vector.scalarDot(target, base) / Math.pow(Vector.length(base), 2);

    return {
      x: base.x * ratio,
      y: base.y * ratio
    }
  },

  orthogonal: function(base) {
    var x, y;

    if (base.x == 0) {
      x = 1;
      y = 0;
    } else if (base.y == 0) {
      x = 0;
      y = 1;
    } else {
      x = -Math.pow(base.y, 2) / base.x;
      y = base.y
    }

    return { x: x, y: y }
  },

  byPoints: function(first, second) {
    var vector = {
      x: second.x - first.x,
      y: second.y - first.y
    }
    
    if (Vector.isZero(vector)) throw Error('Cannot build vector with two equal points');
    
    return vector;
  },

  sum: function(first, second) {
    return {
      x: first.x + second.x,
      y: first.y + second.y
    }
  },

  isZero: function(vector) {
    return vector.x == 0 && vector.y == 0;
  },

  zero: function() {
    return { x: 0, y: 0 };
  }
}