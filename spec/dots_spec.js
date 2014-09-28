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
    var fakeLayout, layoutFn, dots, options;

    beforeEach(function() {
      fakeLayout = {};
      
      layoutFn = jasmine.createSpy('layoutFn').and.callFake(function() {
        return fakeLayout;
      });

      fakeLayout.gravity = layoutFn;
      fakeLayout.charge  = layoutFn;
      fakeLayout.nodes   = layoutFn;
      fakeLayout.size    = layoutFn;
      fakeLayout.start   = layoutFn;
      fakeLayout.chargeDistance = layoutFn;

      spyOn(d3.layout, 'force').and.returnValue(fakeLayout);

      dots = [{}, {}];
      options = Dots.setDefaults();

      Dots.initializeLayout(dots, options);
    });

    it('should create a force layout', function() {
      expect(d3.layout.force).toHaveBeenCalled();
    });

    it('should set gravity to zero', function() {
      expect(fakeLayout.gravity).toHaveBeenCalledWith(0);
    });

    it('should set charge values for the dots', function() {
      expect(fakeLayout.charge).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('should set chargeDistance', function() {
      expect(fakeLayout.chargeDistance).toHaveBeenCalledWith(jasmine.any(Number));
    });

    it('should send dots to the nodes collection', function() {
      expect(fakeLayout.nodes).toHaveBeenCalledWith(dots);
    });

    it('should set appropriate layout sizes', function() {
      expect(fakeLayout.size).toHaveBeenCalled();
    });

    it('should start initialized layout', function() {
      expect(fakeLayout.start).toHaveBeenCalled();
    });
  });

  describe('.initializeCanvas', function() {
    var container, containerFn, options;

    beforeEach(function() {
      options = Dots.setDefaults();

      container = {};
      
      containerFn = jasmine.createSpy('containerFn').and.callFake(function() {
        return container;
      });

      container.append = containerFn;
      container.attr   = containerFn;

      spyOn(d3, 'select').and.returnValue(container);

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
});