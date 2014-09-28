describe('Physics', function() {
  describe('.pushOut', function() {
    var first, second;

    it('should be defined', function() {
      expect(Physics.pushOut).toBeDefined();
    });

    describe('with two objects in a different positions', function() {
      beforeEach(function() {
        first  = { x: 1, y: 2 },
        second = { x: 2, y: 1 }
      });

      describe('closer than allowed distance', function() {
        beforeEach(function() {
          first.radius = second.radius = 10;
        });

        it('should set both object on allowed distance from each other', function() {
          Physics.pushOut(first, second);

          expect(Vector.length(Vector.byPoints(first, second))).toBeCloseTo(first.radius + second.radius);
        });

        it('should move both objects on equal distance', function() {
          var prevFirst  = { x: first.x,  y: first.y  },
              prevSecond = { x: second.x, y: second.y };

          Physics.pushOut(first, second);

          var firstDiff  = Vector.length(Vector.byPoints(first, prevFirst));
          var secondDiff = Vector.length(Vector.byPoints(second, prevSecond));

          expect(firstDiff).toBeCloseTo(secondDiff);
        });
      });
    });

    describe('with two objects in the same position', function() {
      beforeEach(function() {
        first  = { x: 1, y: 1, radius: 10 },
        second = { x: 1, y: 1, radius: 10 };
      });

      it('should throw an error', function() {
        expect(function() { Physics.pushOut(first, second) }).toThrow();
      });
    });
  });

  describe('.checkForCollision', function() {
    it('should be defined', function() {
      expect(Physics.checkForCollision).toBeDefined();
    });

    it('should delegate to check for collision', function() {
      spyOn(Physics, 'onCollision');

      Physics.checkForCollision();

      expect(Physics.onCollision).toHaveBeenCalled();
    });

    describe('with collision found', function() {
      beforeEach(function() {
        spyOn(Physics, 'onCollision').and.callFake(function() {
          arguments[arguments.length - 1]();
        });

        spyOn(Physics, 'pushOut');
        spyOn(Physics, 'updateVelocities');

        Physics.checkForCollision();
      });

      it('should push objects out of each other', function() {
        expect(Physics.pushOut).toHaveBeenCalled();
      });

      it('should update speeds of collided objects', function() {
        expect(Physics.updateVelocities).toHaveBeenCalled();
      });
    });

    describe('without collision', function() {
      beforeEach(function() {
        spyOn(Physics, 'onCollision');
        spyOn(Physics, 'pushOut');
        spyOn(Physics, 'updateVelocities');

        Physics.checkForCollision();
      });

      it('should not push objects out of each other', function() {
        expect(Physics.pushOut).not.toHaveBeenCalled();
      });

      it('should not update speeds of collided objects', function() {
        expect(Physics.updateVelocities).not.toHaveBeenCalled();
      });
    });
  });

  describe('.onCollision', function() {
    var first, second, callback;

    beforeEach(function() {
      callback = jasmine.createSpy('callback');
    });

    it('should be defined', function() {
      expect(Physics.onCollision).toBeDefined();
    });

    describe('with two objects in a different positions', function() {
      beforeEach(function() {
        first  = { x: 5, y: 5 };
        second = { x: 2, y: 2 };
      });

      describe('on a collision distance', function() {
        beforeEach(function() {
          first.radius = second.radius = 10;
        });

        it('should fire callback', function() {
          Physics.onCollision(first, second, callback);

          expect(callback).toHaveBeenCalled();
        });
      });

      describe('on an allowed dinstance', function() {
        beforeEach(function() {
          first.radius = second.radius = 1;
        });

        it('should not fire callback', function() {
          Physics.onCollision(first, second, callback);

          expect(callback).not.toHaveBeenCalled();
        });
      });
    });

    describe('with two objects in the same position', function() {
      beforeEach(function() {
        first   = { x: 1, y: 1 };
        second  = { x: 1, y: 1 };
      });

      describe('having zero sizes', function() {
        beforeEach(function() {
          first.radius = second.radius = 0;
        });

        it('should not fire callback', function() {
          Physics.onCollision(first, second, callback);

          expect(callback).not.toHaveBeenCalled()
        });
      });

      describe('having non-zero sizes', function() {
        beforeEach(function() {
          first.radius = second.radius = 10;
        });

        it('should throw an error', function() {
          expect(function() { Physics.onCollision(first, second, callback) }).toThrow();
        });
      });
    });
  });

  describe('.updateVelocities', function() {
    var first, second, calculateEnergy, calculateImpulse;

    beforeEach(function() {
      calculateEnergy = function(first, second) {
        return Math.pow(first.velocity.x,  2) +
               Math.pow(first.velocity.y,  2) +
               Math.pow(second.velocity.y, 2) +
               Math.pow(second.velocity.y, 2);
      }

      calculateImpulse = function(first, second) {
        return first.velocity.x + second.velocity.x +
               first.velocity.y + second.velocity.y;
      }
    });

    it('should be defined', function() {
      expect(Physics.updateVelocities).toBeDefined();
    });

    describe('with objects in a different positions', function() {
      beforeEach(function() {
        first  = { x: 0, y: 1 };
        second = { x: 1, y: 2 };
      });

      describe('with first object hitting the idle second', function() {
        beforeEach(function() {
          first.velocity  = { x: 1, y: 1 };
          second.velocity = { x: 0, y: 0 }; 
        });

        it('should update speeds of the objects', function() {
          var initialFirstVelocity  = { x: first.velocity.x,  y: first.velocity.y  },
              initialSecondVelocity = { x: second.velocity.x, y: second.velocity.y };

          Physics.updateVelocities(first, second);

          // FIX
          expect([first.velocity, second.velocity]).not.toEqual([initialFirstVelocity, initialSecondVelocity]);
        });

        it('should not change system energy', function() {
          var initialEnergy = calculateEnergy(first, second);

          Physics.updateVelocities(first, second);
          var postEnergy = calculateEnergy(first, second);

          expect(initialEnergy).toBeCloseTo(postEnergy);
        });

        it('should not change system impulse', function() {
          var initialImpulse = calculateImpulse(first, second);

          Physics.updateVelocities(first, second);
          var postImpulse = calculateImpulse(first, second);

          expect(initialImpulse).toBeCloseTo(postImpulse);
        });
      });

      describe('with both objects moving right before impact', function() {
        describe('with different speeds', function() {
          beforeEach(function() {
            first.velocity  = { x: 0, y: 1 };
            second.velocity = { x: 1, y: 1 }; 
          });

          it('should update speeds of the objects', function() {
            var initialFirstVelocity  = { x: first.velocity.x,  y: first.velocity.y  },
                initialSecondVelocity = { x: second.velocity.x, y: second.velocity.y };

            Physics.updateVelocities(first, second);

            // FIX
            expect([first.velocity, second.velocity]).not.toEqual([initialFirstVelocity, initialSecondVelocity]);
          });

          it('should not change system energy', function() {
            var initialEnergy = calculateEnergy(first, second);

            Physics.updateVelocities(first, second);
            var postEnergy = calculateEnergy(first, second);

            expect(initialEnergy).toBeCloseTo(postEnergy);
          });

          it('should not change system impulse', function() {
            var initialImpulse = calculateImpulse(first, second);

            Physics.updateVelocities(first, second);
            var postImpulse = calculateImpulse(first, second);

            expect(initialImpulse).toBeCloseTo(postImpulse);
          });
        });

        describe('with equal speeds', function() {
          beforeEach(function() {
            first.velocity  = { x: 1, y: 1 };
            second.velocity = { x: 1, y: 1 }; 
          });

          it('should not update speeds of the objects', function() {
            var initialFirstVelocity  = { x: first.velocity.x,  y: first.velocity.y  },
                initialSecondVelocity = { x: second.velocity.x, y: second.velocity.y };

            Physics.updateVelocities(first, second);

            // FIX
            expect(first.velocity.x).toBeCloseTo(initialFirstVelocity.x);
            expect(second.velocity.x).toBeCloseTo(initialSecondVelocity.x);
            expect(first.velocity.y).toBeCloseTo(initialFirstVelocity.y);
            expect(second.velocity.y).toBeCloseTo(initialSecondVelocity.y);
          });

          it('should not change system energy', function() {
            var initialEnergy = calculateEnergy(first, second);

            Physics.updateVelocities(first, second);
            var postEnergy = calculateEnergy(first, second);

            expect(initialEnergy).toBeCloseTo(postEnergy);
          });

          it('should not change system impulse', function() {
            var initialImpulse = calculateImpulse(first, second);

            Physics.updateVelocities(first, second);
            var postImpulse = calculateImpulse(first, second);

            expect(initialImpulse).toBeCloseTo(postImpulse);
          });
        });
      });

      describe('with both objects idling before impact', function() {
        beforeEach(function() {
          first.velocity  = { x: 0, y: 0 };
          second.velocity = { x: 0, y: 0 };
        });

        it('should not update speeds of the objects', function() {
          var initialFirstVelocity  = { x: first.velocity.x,  y: first.velocity.y  },
              initialSecondVelocity = { x: second.velocity.x, y: second.velocity.y };

          Physics.updateVelocities(first, second);

          // FIX
          expect([first.velocity, second.velocity]).toEqual([initialFirstVelocity, initialSecondVelocity]);
        });

        it('should not change system energy', function() {
          var initialEnergy = calculateEnergy(first, second);

          Physics.updateVelocities(first, second);
          var postEnergy = calculateEnergy(first, second);

          expect(initialEnergy).toBeCloseTo(postEnergy);
        });

        it('should not change system impulse', function() {
          var initialImpulse = calculateImpulse(first, second);

          Physics.updateVelocities(first, second);
          var postImpulse = calculateImpulse(first, second);

          expect(initialImpulse).toBeCloseTo(postImpulse);
        });
      });
    });

    describe('with objects in the same position', function() {
      beforeEach(function() {
        first  = { x: 0, y: 1 };
        second = { x: 0, y: 1 };
      });

      it('it should throw an error', function() {
        expect(function() { Physics.updateVelocities(first, second) }).toThrow();
      });
    });
  });

  describe('.checkForBorderCollision', function() {
    var target, height, width;

    beforeEach(function() {
      target = { x: 100, y: 100, radius: 10, velocity: { x: 5, y: 5} };
    });

    it('should be defined', function() {
      expect(Physics.checkForBorderCollision).toBeDefined();
    });

    describe('with a vertical hit', function() {
      beforeEach(function() {
        height = 50;
        width  = 1000; 
      });

      it('should redirect vertical velocity', function() {
        var prevVelocity = target.velocity.y;

        Physics.checkForBorderCollision(target, width, height);

        expect(-prevVelocity).toEqual(target.velocity.y);
      });

      it('should not change horizontal velocity', function() {
        var prevVelocity = target.velocity.x;

        Physics.checkForBorderCollision(target, width, height);

        expect(prevVelocity).toEqual(target.velocity.x);
      });

      it('should move the object back into bounds', function() {
        var prevCoord = { y: target.y };

        Physics.checkForBorderCollision(target, width, height);

        expect(target.y).toBe(height - target.radius);
      });
    });

    describe('with a horizontal hit', function() {
      beforeEach(function() {
        height = 1000;
        width  = 50; 
      });

      it('should redirect horizontal velocity', function() {
        var prevVelocity = target.velocity.x;

        Physics.checkForBorderCollision(target, width, height);

        expect(-prevVelocity).toEqual(target.velocity.x);
      });

      it('should not change vertical velocity', function() {
        var prevVelocity = target.velocity.y;

        Physics.checkForBorderCollision(target, width, height);

        expect(prevVelocity).toEqual(target.velocity.y);
      });

      it('should move the object back into bounds', function() {
        var prevCoord = { y: target.x };

        Physics.checkForBorderCollision(target, width, height);

        expect(target.x).toBe(width - target.radius);
      });
    });

    describe('with a simultanious hit', function() {
      beforeEach(function() {
        height = 50;
        width  = 50; 
      });

      it('should redirect horizontal velocity', function() {
        var prevVelocity = target.velocity.x;

        Physics.checkForBorderCollision(target, width, height);

        expect(-prevVelocity).toEqual(target.velocity.x);
      });

      it('should redirect vertical velocity', function() {
        var prevVelocity = target.velocity.y;

        Physics.checkForBorderCollision(target, width, height);

        expect(-prevVelocity).toEqual(target.velocity.y);
      });

      it('should move the object back into bounds', function() {
        Physics.checkForBorderCollision(target, width, height);
        var position = { x: target.x, y: target.y };

        expect(position).toEqual({ x: width - target.radius, y: height - target.radius });
      });
    });
  });

  describe('.onBorderHit', function() {
    var coord, radius, limit, callback;

    beforeEach(function() {
      callback = jasmine.createSpy('callback');
    });

    it('should be defined', function() {
      expect(Physics.onBorderHit).toBeDefined();
    });

    it('should fire callback if coord is less than radius', function() {
      Physics.onBorderHit(1, 10, 1, callback);

      expect(callback).toHaveBeenCalled();
    });

    it('should fire callback if coord is too close to limit', function() {
      Physics.onBorderHit(15, 10, 20, callback);

      expect(callback).toHaveBeenCalled();
    });
  });
});