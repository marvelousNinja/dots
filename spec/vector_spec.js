describe('Vector', function() {
  it('should be defined', function() {
    expect(Vector).toBeDefined();
  });

  describe('.length', function() {
    it('should be defined', function() {
      expect(Vector.length).toBeDefined();
    });

    it('should return zero for zero vector', function() {
      expect(Vector.length(Vector.zero())).toBe(0);
    });

    it('should return square root of two for unit vector', function() {
      expect(Vector.length({ x: 1, y: 1 })).toBe(Math.sqrt(2));
    });

    it('should return square root of two for negative unit vector', function() {
      expect(Vector.length({ x: -1, y: -1 })).toBe(Math.sqrt(2));
    });
  });

  describe('.scalarDot', function() {
    it('should be defined', function() {
      expect(Vector.scalarDot).toBeDefined();
    });

    it('should return zero if there are zero vectors in arguments', function() {
      expect(Vector.scalarDot(Vector.zero(), { x: 1, y: 1 })).toBe(0);
    });

    it('should return two for two unit vectors', function() {
      expect(Vector.scalarDot({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(2);
    });
  });

  describe('.project', function() {
    it('should be defined', function() {
      expect(Vector.project).toBeDefined();
    });

    it('should return zero vector for two orthogonal vectors', function() {
      var target  = { x: 0, y: 1 },
          base    = { x: 1, y: 0 };

      expect(Vector.project(target, base)).toEqual(Vector.zero());
    });

    it('should return the same vector if it projected on itself', function() {
      var target = { x: 0, y: 1 };

      expect(Vector.project(target, target)).toEqual(target);
    });

    it('should return zero vector if it projected on anything else', function() {
      var target = Vector.zero(),
          base   = { x: 1, y: 1 };

      expect(Vector.project(target, base)).toEqual(target);
    });

    it('should return zero projections on zero vector', function() {
      var target = { x: 1, y: 1 },
          base   = Vector.zero();

      expect(Vector.project(target, base)).toEqual(base);
    });
  });

  describe('.orthogonal', function() {
    it('should be defined', function() {
      expect(Vector.orthogonal).toBeDefined();
    });

    it('should return (1,0) for (0,1) vector', function() {
      var target = { x: 0, y: 1 };

      expect(Vector.orthogonal(target)).toEqual({ x: 1, y: 0 });
    });

    it('should return (0,1) for (1,0) vector', function() {
      var target = { x: 1, y: 0 };

      expect(Vector.orthogonal(target)).toEqual({ x: 0, y: 1 });
    });

    it('should return orthogonal vector', function() {
      var target     = { x: 12, y: 15 },
          orthogonal = Vector.orthogonal(target);

      expect(Vector.scalarDot(target, orthogonal)).toBe(0);
    });

    it('should return suitable orthogonal vector for zero vector', function() {
      var zero       = Vector.zero(),
          orthogonal = Vector.orthogonal(zero);

      expect(Vector.scalarDot(zero, orthogonal)).toEqual(0);
    });
  });

  describe('.byPoints', function() {
    it('should be defined', function() {
      expect(Vector.byPoints).toBeDefined();
    });

    it('should return vector, parallel to the vector which goes right through given points', function() {
      var first  = { x: 1,  y: 1 },
          second = { x: 2,  y: 2 },
          vector = { x: 3,  y: 3 },
          result = Vector.byPoints(first, second);
      
      expect(vector.x / result.x).toBe(vector.y / result.y);
    });

    it('should throw error for equal points', function() {
      expect(function() { Vector.byPoints({ x: 1, y: 0 }, { x: 1, y: 0}) }).toThrow();
    });
  });

  describe('.sum', function() {
    it('should be defined', function() {
      expect(Vector.sum).toBeDefined();
    });

    it('should return geometrical sum of two vectors', function() {
      expect(Vector.sum({ x: 1, y: 1 }, { x: 2, y: 2})).toEqual({ x: 3, y: 3 });
    });

    it('should return vector of the correct length', function() {
      var first  = { x: 5, y: 0},
          second = { x: 0, y: 5},
          length = Math.sqrt(Math.pow(first.x, 2) + Math.pow(second.y, 2));

      expect(Vector.length(Vector.sum(first, second))).toBe(length); 
    });

    it('should return zero vector for the sum of two zero vectors', function() {
      var zero = Vector.zero();

      expect(Vector.sum(zero, zero)).toEqual(zero);
    });
  });
});