describe('Physics', function() {
  describe('.pushOut', function() {
    var first, 
        second, 
        xDiff, 
        yDiff,
        currentDistance,
        allowedDistance,
        pushOutCall;

    beforeEach(function() {
      pushOutCall = function() {
        Physics.pushOut(first, second, xDiff, yDiff, currentDistance, allowedDistance);
      };
    });

    describe('with two objects in a different positions', function() {
      beforeEach(function() {
        first  = { x: 1, y: 2 },
        second = { x: 2, y: 1 },
        xDiff  = -1,
        yDiff  = 1,
        currentDistance = Math.sqrt(2);
      });

      describe('closer than allowed distance', function() {
        beforeEach(function() {
          allowedDistance = 3;
        });

        it('should set both object on allowed distance from each other', function() {
          pushOutCall();
          expect(Vector.length(Vector.byPoints(first, second))).toBeCloseTo(allowedDistance);
        });

        it('should move both objects on equal distance', function() {
          var prevFirst = {
                x: first.x,
                y: first.y
              },
              prevSecond = {
                x: second.x,
                y: second.y
              }

          pushOutCall();

          var firstDiff  = Vector.length(Vector.byPoints(first, prevFirst));
          var secondDiff = Vector.length(Vector.byPoints(second, prevSecond));

          expect(firstDiff).toBeCloseTo(secondDiff);
        });
      });

      describe('farther than allowed distance', function() {
        beforeEach(function() {
          allowedDistance = 1;
        });

        it('should not modify objects positions', function() {
          var prevFirst = {
              x: first.x,
              y: first.y
            },
            prevSecond = {
              x: second.x,
              y: second.y
            }

          pushOutCall();

          expect([prevFirst, prevSecond]).toEqual([first, second]);
        });
      });
    });

    describe('with two objects in the same position', function() {
      beforeEach(function() {
        first  = { x: 1, y: 1 },
        second = { x: 1, y: 1 },
        xDiff  = 0,
        yDiff  = 0,
        currentDistance = 0;
      });

      xit('should not modify objects positions', function() {
        var prevFirst = {
              x: first.x,
              y: first.y
            },
            prevSecond = {
              x: second.x,
              y: second.y
            }

        pushOutCall();

        expect([prevFirst, prevSecond]).toEqual([first, second]);
      });
    });
  });

  describe('.checkForCollision', function() {
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
        spyOn(Physics, 'speedsAfterCollision');

        Physics.checkForCollision();
      });

      it('should push objects out of each other', function() {
        expect(Physics.pushOut).toHaveBeenCalled();
      });

      it('should update speeds of collided objects', function() {
        expect(Physics.speedsAfterCollision).toHaveBeenCalled();
      });
    });

    describe('without collision', function() {
      beforeEach(function() {
        spyOn(Physics, 'onCollision');
        spyOn(Physics, 'pushOut');
        spyOn(Physics, 'speedsAfterCollision');

        Physics.checkForCollision();
      });

      it('should not push objects out of each other', function() {
        expect(Physics.pushOut).not.toHaveBeenCalled();
      });

      it('should not update speeds of collided objects', function() {
        expect(Physics.speedsAfterCollision).not.toHaveBeenCalled();
      });
    });
  });

  describe('.onCollision', function() {
    var first,
        second,
        options,
        callback,
        onCollisionCall;

    beforeEach(function() {
      callback = jasmine.createSpy('callback');

      onCollisionCall = function() {
        Physics.onCollision(first, second, options, callback);
      }
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
          onCollisionCall();
          expect(callback).toHaveBeenCalled();
        });
      });

      describe('on an allowed dinstance', function() {
        beforeEach(function() {
          first.radius = second.radius = 1;
        });

        it('should not fire callback', function() {
          onCollisionCall();
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
          onCollisionCall();
          expect(callback).not.toHaveBeenCalled()
        });
      });

      describe('having non-zero sizes', function() {
        beforeEach(function() {
          first.radius = second.radius = 10;
        });

        it('should fire callback', function() {
          onCollisionCall();
          expect(callback).toHaveBeenCalled();
        });
      });
    });
  });

  describe('.speedsAfterCollision', function() {
    var first,
        second,
        calculateEnergy,
        calculateImpulse;

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
          var initialFirstVelocity = {
                x: first.velocity.x,
                y: first.velocity.y
              },
              initialSecondVelocity = {
                x: second.velocity.x,
                y: second.velocity.y
              }

          Physics.speedsAfterCollision(first, second);

          expect([first.velocity, second.velocity]).not.toEqual([initialFirstVelocity, initialSecondVelocity]);
        });

        it('should not change system energy', function() {
          var initialEnergy = calculateEnergy(first, second);
          Physics.speedsAfterCollision(first, second);
          var postEnergy = calculateEnergy(first, second);

          expect(initialEnergy).toBeCloseTo(postEnergy);
        });

        it('should not change system impulse', function() {
          var initialImpulse = calculateImpulse(first, second);
          Physics.speedsAfterCollision(first, second);
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
            var initialFirstVelocity = {
                  x: first.velocity.x,
                  y: first.velocity.y
                },
                initialSecondVelocity = {
                  x: second.velocity.x,
                  y: second.velocity.y
                }

            Physics.speedsAfterCollision(first, second);

            expect([first.velocity, second.velocity]).not.toEqual([initialFirstVelocity, initialSecondVelocity]);
          });

          it('should not change system energy', function() {
            var initialEnergy = calculateEnergy(first, second);
            Physics.speedsAfterCollision(first, second);
            var postEnergy = calculateEnergy(first, second);

            expect(initialEnergy).toBeCloseTo(postEnergy);
          });

          it('should not change system impulse', function() {
            var initialImpulse = calculateImpulse(first, second);
            Physics.speedsAfterCollision(first, second);
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
            var initialFirstVelocity = {
                  x: first.velocity.x,
                  y: first.velocity.y
                },
                initialSecondVelocity = {
                  x: second.velocity.x,
                  y: second.velocity.y
                }

            Physics.speedsAfterCollision(first, second);

            expect(first.velocity.x).toBeCloseTo(initialFirstVelocity.x);
            expect(second.velocity.x).toBeCloseTo(initialSecondVelocity.x);
            expect(first.velocity.y).toBeCloseTo(initialFirstVelocity.y);
            expect(second.velocity.y).toBeCloseTo(initialSecondVelocity.y);
          });

          it('should not change system energy', function() {
            var initialEnergy = calculateEnergy(first, second);
            Physics.speedsAfterCollision(first, second);
            var postEnergy = calculateEnergy(first, second);

            expect(initialEnergy).toBeCloseTo(postEnergy);
          });

          it('should not change system impulse', function() {
            var initialImpulse = calculateImpulse(first, second);
            Physics.speedsAfterCollision(first, second);
            var postImpulse = calculateImpulse(first, second);

            expect(initialImpulse).toBeCloseTo(postImpulse);
          });
        });
      });

      describe('with both objects idling before impact', function() {
        describe('with different speeds', function() {
          beforeEach(function() {
            first.velocity  = { x: 0, y: 0 };
            second.velocity = { x: 0, y: 0 }; 
          });

          it('should not update speeds of the objects', function() {
            var initialFirstVelocity = {
                  x: first.velocity.x,
                  y: first.velocity.y
                },
                initialSecondVelocity = {
                  x: second.velocity.x,
                  y: second.velocity.y
                }

            Physics.speedsAfterCollision(first, second);

            expect([first.velocity, second.velocity]).toEqual([initialFirstVelocity, initialSecondVelocity]);
          });

          it('should not change system energy', function() {
            var initialEnergy = calculateEnergy(first, second);
            Physics.speedsAfterCollision(first, second);
            var postEnergy = calculateEnergy(first, second);

            expect(initialEnergy).toBeCloseTo(postEnergy);
          });

          it('should not change system impulse', function() {
            var initialImpulse = calculateImpulse(first, second);
            Physics.speedsAfterCollision(first, second);
            var postImpulse = calculateImpulse(first, second);

            expect(initialImpulse).toBeCloseTo(postImpulse);
          });
        });
      });
    });

    describe('with objects in the same position', function() {
      xit('it should throw an error', function() {

      });
    });
  });
});