describe('Dots', function() {
  it('should be defined', function() {
    expect(Physics).toBeDefined();
  });

  describe('.initialize', function() {
    beforeEach(function() {
      spyOn(Dots, 'setDefaults');
      spyOn(Dots, 'initializeDots');
      spyOn(Dots, 'initializePointer');
      spyOn(Dots, 'initializeLayout');
      spyOn(Dots, 'initializeCanvas');
      spyOn(Dots, 'initializeContext');
      spyOn(Dots, 'initializeLayoutHandlers');
      spyOn(Dots, 'initializeMouseHandlers');

      Dots.initialize();
    });

    it('should be defined', function() {
      expect(Dots.initialize).toBeDefined();
    });

    it('should set default options', function() {
      expect(Dots.setDefaults).toHaveBeenCalled();
    });

    it('should initialize dots collection', function() {
      expect(Dots.initializeDots).toHaveBeenCalled();
    });

    it('should initialize pointer dot', function() {
      expect(Dots.initializePointer).toHaveBeenCalled();
    });

    it('should initialize layout', function() {
      expect(Dots.initializeLayout).toHaveBeenCalled();
    });

    it('should initialize canvas', function() {
      expect(Dots.initializeCanvas).toHaveBeenCalled();
    });

    it('should initialize canvas context', function() {
      expect(Dots.initializeContext).toHaveBeenCalled();
    });

    it('should initialize layout handlers', function() {
      expect(Dots.initializeLayoutHandlers).toHaveBeenCalled();
    });

    it('should initialize mouse handlers', function() {
      expect(Dots.initializeMouseHandlers).toHaveBeenCalled();
    });
  });

  describe('.setDefaults', function() {
    it('should be defined', function() {
      expect(Dots.setDefaults).toBeDefined();
    });

    it('should not fail without parameters', function() {
      expect(function() { Dots.setDefaults() }).not.toThrow();
    });

    it('should return sane list of parameters by default', function() {
      var options = jasmine.objectContaining({
        width:  jasmine.any(Number),
        height: jasmine.any(Number),
        count:  jasmine.any(Number),
        radius: jasmine.any(Number),
        container: jasmine.any(String)
      });

      expect(Dots.setDefaults()).toEqual(options);
    });

    it('should not override present parameters', function() {
      var options = { height: 100 };
      expect(Dots.setDefaults(options).height).toEqual(100);
    });

    it('should set missing parameters', function() {
      expect(Dots.setDefaults({}).width).toBeDefined();
    });
  });

  describe('.initializeDots', function() {
    var options;

    beforeEach(function() {
      options = Dots.setDefaults();
    });

    it('should be defined', function() {
      expect(Dots.initializeDots).toBeDefined();
    });

    it('should return correct number of initialized dots', function() {
      expect(Dots.initializeDots(options).length).toBe(options.count + 1);
    });

    it('should generate dots using d3 range method', function() {
      spyOn(d3, 'range').and.returnValue([]);
      spyOn(Array.prototype, 'map');

      Dots.initializeDots(options);

      expect(d3.range).toHaveBeenCalledWith(options.count + 1);
    });
  });

  describe('.initializePointer', function() {
    var dots = [ { x: 1, y: 1 } ];

    it('should be defined', function() {
      expect(Dots.initializePointer).toBeDefined();
    });

    it('should mark first dot as fixed', function() {
      Dots.initializePointer(dots);

      expect(dots[0].fixed).toBeTruthy();
    });
  });

  describe('.initializeLayout', function() {
    var layout, dots, options;

    beforeEach(function() {
      layout = jasmine.createSpyObj('layout', [
        'gravity',
        'charge',
        'chargeDistance',
        'nodes',
        'size',
        'start'
      ]);

      var returnLayout = function() { return layout };

      layout.gravity.and.callFake(returnLayout);
      layout.charge.and.callFake(returnLayout);
      layout.nodes.and.callFake(returnLayout);
      layout.size.and.callFake(returnLayout);
      layout.start.and.callFake(returnLayout);
      layout.chargeDistance.and.callFake(returnLayout);
      spyOn(d3.layout, 'force').and.callFake(returnLayout);

      dots = [{}, {}];
      options = Dots.setDefaults();

      Dots.initializeLayout(dots, options);
    });

    it('should create a force layout', function() {
      expect(d3.layout.force).toHaveBeenCalled();
    });

    it('should set gravity to zero', function() {
      expect(layout.gravity).toHaveBeenCalledWith(0);
    });

    it('should set charge values for the dots', function() {
      expect(layout.charge).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('should set chargeDistance', function() {
      expect(layout.chargeDistance).toHaveBeenCalledWith(jasmine.any(Number));
    });

    it('should send dots to the nodes collection', function() {
      expect(layout.nodes).toHaveBeenCalledWith(dots);
    });

    it('should set appropriate layout sizes', function() {
      expect(layout.size).toHaveBeenCalled();
    });

    it('should start initialized layout', function() {
      expect(layout.start).toHaveBeenCalled();
    });
  });

  describe('.initializeCanvas', function() {
    var container, options;

    beforeEach(function() {
      options = Dots.setDefaults();

      container = jasmine.createSpyObj('container', ['append', 'attr']);

      var returnContainer = function() { return container };

      container.append.and.callFake(returnContainer);
      container.attr.and.callFake(returnContainer);
      spyOn(d3, 'select').and.callFake(returnContainer);

      Dots.initializeCanvas(options);
    });

    it('should be defined', function() {
      expect(Dots.initializeCanvas).toBeDefined();
    });

    it('should use d3 selectors to find the container', function() {
      expect(d3.select).toHaveBeenCalledWith(options.container);
    });

    it('should append canvas element to it', function() {
      expect(container.append).toHaveBeenCalledWith('canvas');
    });

    it('should set width of the container', function() {
      expect(container.attr).toHaveBeenCalledWith('width', options.width);
    });

    it('should set height of the container', function() {
      expect(container.attr).toHaveBeenCalledWith('height', options.height);
    });
  });

  describe('.initializeContext', function() {
    var canvas, node;

    beforeEach(function() {
      node   = { getContext: jasmine.createSpy('getContext') }
      canvas = { node: function() { return node } }

      Dots.initializeContext(canvas);
    });

    it('should be defined', function() {
      expect(Dots.initializeContext).toBeDefined();
    });

    it('should get the condext from the canvas node', function() {
      expect(node.getContext).toHaveBeenCalledWith('2d');
    });
  });

  describe('.initializeLayoutHandlers', function() {
    var layout, handler;

    beforeEach(function() {
      layout = { on: jasmine.createSpy('layoutOn') }
      spyOn(Dots, 'tickHandler').and.returnValue(function() {});

      Dots.initializeLayoutHandlers(layout);
    });

    it('should be defined', function() {
      expect(Dots.initializeLayoutHandlers).toBeDefined();
    });

    it('should set handler for tick event', function() {
      expect(layout.on).toHaveBeenCalledWith('tick', jasmine.any(Function));
    });

    it('should generate appropriate handler', function() {
      expect(Dots.tickHandler).toHaveBeenCalled();
    });
  });

  describe('.initializeMouseHandlers', function() {
    var canvas, pointer;

    beforeEach(function() {
      canvas = { on: jasmine.createSpy('canvasOn') }
      spyOn(Dots, 'movePointerHandler').and.returnValue(function() {});

      Dots.initializeMouseHandlers(canvas, pointer);
    });

    it('should be defined', function() {
      expect(Dots.initializeMouseHandlers).toBeDefined();
    });

    it('should set handler for mousemove event', function() {
      expect(canvas.on).toHaveBeenCalledWith('mousemove', jasmine.any(Function));
    });

    it('should generate appropriate handler', function() {
      expect(Dots.movePointerHandler).toHaveBeenCalled();
    });
  });

  describe('.movePointerHandler', function() {
    var pointer, mouseCoordinates;

    beforeEach(function() {
      pointer = {};
      mouseCoordinates = [100, 200];
      spyOn(d3, 'mouse').and.returnValue(mouseCoordinates);

      handler = Dots.movePointerHandler(pointer);

      handler();
    });

    it('should get current mouse coordinates', function() {
      expect(d3.mouse).toHaveBeenCalled();
    });

    it('should set pointer px to first mouse coordinate', function() {
      expect(pointer.px).toBe(mouseCoordinates[0]);
    })

    it('should set pointer py to second mouse coordinate', function() {
      expect(pointer.py).toBe(mouseCoordinates[1]);
    });
  });

  describe('.tickHandler', function() {
    var handler, layout;
    
    beforeEach(function() {
      layout = { resume: jasmine.createSpy('layoutResume') }
      spyOn(Dots, 'refresh');
      spyOn(Dots, 'solveCollisions');
      spyOn(Dots, 'move');
      spyOn(Dots, 'updateColors');

      handler = Dots.tickHandler(layout);

      handler();
    });

    it('should be defined', function() {
      expect(Dots.tickHandler).toBeDefined();
    });

    it('should refresh dots on a tick', function() {
      expect(Dots.refresh).toHaveBeenCalled();
    });

    it('should solve all collisions on a tick', function() {
      expect(Dots.solveCollisions).toHaveBeenCalled();
    });

    it('should move all dots according to their velocities on a tick', function() {
      expect(Dots.move).toHaveBeenCalled();
    });

    it('should update colors of the dots on a tick', function() {
      expect(Dots.updateColors).toHaveBeenCalled();
    });

    it('should resume layout in order to sustain animation loop', function() {
      expect(layout.resume).toHaveBeenCalled();
    });
  });

  describe('.solveCollisions', function() {
    var quadtree, dots;

    beforeEach(function() {
      quadtree = jasmine.createSpyObj('quadtree', ['visit']);
      spyOn(d3.geom, 'quadtree').and.returnValue(quadtree);
      spyOn(Dots, 'solveCollisionsFor');

      dots = [{}, {}, {}];

      Dots.solveCollisions(dots);
    });

    it('should be defined', function() {
      expect(Dots.solveCollisions).toBeDefined();
    });

    it('should build a quadtree from dots', function() {
      expect(d3.geom.quadtree).toHaveBeenCalledWith(dots);
    });

    it('should check for collisions for each dot', function() {
      expect(Dots.solveCollisionsFor.calls.count()).toBe(dots.length);
    });
  });

  describe('.refresh', function() {
    var context, dots, options;

    beforeEach(function() {
      context = jasmine.createSpyObj('context', [
        'clearRect',
        'beginPath',
        'moveTo',
        'arc',
        'closePath',
        'fill'
      ]);

      spyOn(Dots, 'rgbColor').and.returnValue('rgb(1,2,3)');

      options = {};
    });

    it('should be defined', function() {
      expect(Dots.refresh).toBeDefined();
    });

    describe('having just one dot', function() {
      describe('which is fixed', function() {
        beforeEach(function() {
          dots = [{ fixed: true }];

          Dots.refresh(context, dots, options);
        });

        it('should clear canvas before drawing', function() {
          expect(context.clearRect).toHaveBeenCalled();
        });

        it('should not even start drawing path', function() {
          expect(context.beginPath).not.toHaveBeenCalled();
        });
      });

      describe('which is normal', function() {
        beforeEach(function() {
          dots = [{}];

          Dots.refresh(context, dots, options);
        });

        it('should clear canvas before drawing', function() {
          expect(context.clearRect).toHaveBeenCalled();
        });

        it('should begin drawing path', function() {
          expect(context.beginPath).toHaveBeenCalled();
        });

        it('should set fill style', function() {
          expect(context.fillStyle).toBe(Dots.rgbColor());
        });

        it('should move brush to the each dot position', function() {
          expect(context.moveTo).toHaveBeenCalled();
        });

        it('should draw an arc around each dot position', function() {
          expect(context.arc).toHaveBeenCalled();
        });

        it('should close drawing path', function() {
          expect(context.closePath).toHaveBeenCalled();
        });

        it('should fill the canvas', function() {
          expect(context.fill).toHaveBeenCalled();
        });
      });
    });
  });

  describe('.rgbColor', function() {
    var color;

    beforeEach(function() {
      color = { red: 1, green: 1, blue: 1 };
    });

    it('should be defined', function() {
      expect(Dots.rgbColor).toBeDefined();
    })

    it('should return stringified representation of color variable', function() {
      expect(Dots.rgbColor(color)).toBe('rgb(1,1,1)');
    });
  });

  describe('.updateColors', function() {
    it('should be defined', function() {
      expect(Dots.updateColors).toBeDefined();
    });

    describe('with just one dot', function() {
      var dot;

      beforeEach(function() {
        dot = { color: { green: 100 } };
      });

      describe('with positive animation direction', function() {
        beforeEach(function() {
          dot.color.animationDirection = 1;
        });

        it('should increase green component', function() {
          var prevGreen = dot.color.green;
          Dots.updateColors([dot]);
          expect(dot.color.green).toBeGreaterThan(prevGreen);
        });
      });

      describe('with negative animation direction', function() {
        beforeEach(function() {
          dot.color.animationDirection = -1;
        });

        it('should decrease green component', function() {
          var prevGreen = dot.color.green;
          Dots.updateColors([dot]);
          expect(dot.color.green).toBeLessThan(prevGreen);
        });
      });
    });
  });

  describe('.move', function() {
    var dots;

    it('should be defined', function() {
      expect(Dots.move).toBeDefined();
    });

    describe('with just one dot', function() {
      describe('which is fixed', function() {
        beforeEach(function() {
          dots = [{ x: 1, y: 1, velocity: { x: 1, y: 1 }, fixed: true }];
        });

        it('should not move that point', function() {
          var prevX = dots[0].x,
              prevY = dots[0].y;

          Dots.move(dots);

          expect([dots[0].x, dots[0].y]).not.toEqual([prevX + dots[0].velocity.x, prevY + dots[0].velocity.y])
        });
      });

      describe('which is normal', function() {
        beforeEach(function() {
          dots = [{ x: 1, y: 1, velocity: { x: 1, y: 1} }];
        });

        it('should update position of the dot accordingly', function() {
          var prevX = dots[0].x,
              prevY = dots[0].y;

          Dots.move(dots);

          expect([dots[0].x, dots[0].y]).toEqual([prevX + dots[0].velocity.x, prevY + dots[0].velocity.y])
        });
      });
    });

    describe('.solveCollisionsFor', function() {
      var dot, options;

      beforeEach(function() {
        dot = { x: 1, y: 1 };
        options = {};

        spyOn(Physics, 'checkForBorderCollision');
        spyOn(Physics, 'checkForCollision')
      });

      it('should be defined', function() {
        expect(Dots.solveCollisionsFor).toBeDefined();
      });

      describe('with fixed dot', function() {
        beforeEach(function() {
          dot.fixed = true;
        });

        it('should not check for dot and border collision', function() {
          Dots.solveCollisionsFor(dot, options);
          expect(Physics.checkForBorderCollision).not.toHaveBeenCalled();
        });

        it('should return function without collision checks', function() {
          var anotherDot = { point: { x: 2, y: 2 } };
              handler    = Dots.solveCollisionsFor(dot, options);

          handler(anotherDot);

          expect(Physics.checkForCollision).not.toHaveBeenCalled();
        });
      });

      describe('with normal dot', function() {
        it('should check for dot and border collision', function() {
          Dots.solveCollisionsFor(dot, options);
          expect(Physics.checkForBorderCollision).toHaveBeenCalled();
        });

        it('should return function with collision checks', function() {
          var anotherDot = { point: { x: 2, y: 2 } };
              handler    = Dots.solveCollisionsFor(dot, options);

          handler(anotherDot);

          expect(Physics.checkForCollision).toHaveBeenCalled();
        });
      });
    });
  });
});