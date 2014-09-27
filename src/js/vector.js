var Vector = {
  length: function(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  },

  scalarDot: function(first, second) {
    return first.x * second.x + first.y * second.y;
  },

  project: function(target, base) {
    var ratio = Vector.scalarDot(target, base) / Math.pow(Vector.length(base), 2);

    return {
      x: base.x * ratio,
      y: base.y * ratio
    }
  },

  orthogonal: function(base) {
    if (base.x == 0 && base.y == 0) {
      throw Error('Quite everything will be orthogonal to it');
    }

    if (base.x == 0) {
      return {
        x: 1,
        y: 0
      }
    } else {
      if (base.y == 0) {
        return {
          x: 0,
          y: 1
        }
      } else {
        return {
          x: -Math.pow(base.y, 2) / base.x,
          y: base.y
        }
      }
    }
  },

  byPoints: function(first, second) {
    return {
      x: second.x - first.x,
      y: second.y - first.y
    }
  },

  sum: function(first, second) {
    return {
      x: first.x + second.x,
      y: first.y + second.y
    }
  }
}