require("node-test-helper");

const async = require('async');
const path = require("upath");
const Self = require(path.join(process.cwd(), "lib", "sails-factory"));

describe(TEST_NAME, function() {

  describe("constructor", function() {

    it("should return factory instance given a name", function() {
      var obj = new Self("sample");
      expect(obj).to.be.an.instanceof(Self);
      expect(obj.modelName).to.equal(obj.modelName);
    });
  });

  describe("Use getModelPath", function() {
    it("should return the path of factory in default folder", function() {
      var obj = new Self().getModelPath('sample');
      expect(obj).to.contain('/test/factories/sample');
    });

    it("should load factories from path", function() {
      var obj = new Self().load('test/factories');
      expect(obj).to.equal(1);
    });

    it("should load factories with callback ", function() {
      new Self().load('test/factories', function(count){
        expect(count).to.equal(1);
      });
    });
  });

  describe("Use load method", function() {
    it("should load factories without path", function() {
      var obj = new Self().load();
      expect(obj).to.equal(1);
    });

    it("should load factories from path", function() {
      var obj = new Self().load('test/factories');
      expect(obj).to.equal(1);
    });

    it("should load factories with callback ", function() {
      var obj = new Self().load('test/factories', function(count){
        expect(count).to.equal(1);
      });
    });
  });

  describe("Use build method to get static factory", function() {
    describe('With callback', function() {
      it('should return an object instance of a defined factory', function(done) {
        Self.build('sample', function(sample) {
          expect(sample).to.have.property('foo', 'bar');
          expect(sample).to.have.property('hello', 'ok');
          done();
        });
      });
  
      it('should return an object instance of a defined factory with overridden attributes', function(done) {
        Self.build('sample', {'foo': 'baz'}, function(sample) {
          expect(sample).to.have.property('foo', 'baz');
          expect(sample).to.have.property('hello', 'ok');
          done();
        });
      });
    })
    
    describe('Without callback', function() {
      it('should return an object instance of a defined factory', 
        async function() {
          var sample = await Self.build('sample');
          expect(sample).to.have.property('foo', 'bar');
          expect(sample).to.have.property('hello', 'ok');
      });
      it('should return an object instance of a defined factory with overridden attributes', 
        async function() {
          var sample = await Self.build('sample', {'foo': 'baz'});
          expect(sample).to.have.property('foo', 'baz');
          expect(sample).to.have.property('hello', 'ok');
      });
    });
  });

  describe('Use create method', function() {
    before(function() {
      Self.define('sample')
        .attr('title', 'my title')
        .attr('description', 'my description');
    });

    it('should return a model instance of a defined factory from Sails Factory Object', async function(done) {
      let factory = new Self('sample');
      let obj = await factory.create('sample');
      expect(obj).to.have.property('id');
      expect(obj).to.have.property('foo', 'bar');
      expect(obj).to.have.property('hello', 'ok');
      done();
    });
    
    describe('With callback', function() {
      it('should return a model instance of a defined factory from static context', async function(done) {
        await Self.create('sample', function(sample) {
          expect(sample).to.have.property('id');
          expect(sample).to.have.property('foo', 'bar');
          expect(sample).to.have.property('hello', 'ok');
          done();
        });
      });
  
      it('should return a model instance of a defined factory with overridden attributes from static context', async function(done) {
        await Self.create('sample', { 
          foo: 'hello'
        }, function(sample) {
          expect(sample).to.have.property('id');
          expect(sample).to.have.property('foo', 'hello');
          expect(sample).to.have.property('hello', 'ok');
          done();
        });
      });
    });

    describe('Without callback', function() {
      it('should return a model instance of a defined factory from static context', async function(done) {
        let obj = await Self.create('sample');
        expect(obj).to.have.property('id');
        expect(obj).to.have.property('foo', 'bar');
        expect(obj).to.have.property('hello', 'ok');
        done();
      });
  
      it('should return a model instance of a defined factory with overridden attributes from static context', async function(done) {
        let obj = await Self.create('sample', { 
          foo: 'hello'
        });
        expect(obj).to.have.property('id');
        expect(obj).to.have.property('foo', 'hello');
        expect(obj).to.have.property('hello', 'ok');
        done();
      });
    });
  });
  

  describe("Use define method", function() {
    it('should return a model instance define with define method from Sails Factory object', function() {
      let sFactory = new Self();
      let factory = sFactory.define('sample2')
        .attr('foo', 'bar')
        .attr('hello', 'ok')
      expect(sFactory.getFactory('sample2')).to.equal(factory)
    });

    it('should return a model instance define with define method from static context', function() {
      let factory = Self.define('sample2')
        .attr('foo', 'bar')
        .attr('hello', 'ok')

      expect(new Self().getFactory('sample2')).to.equal(factory)
    });
  });

  describe('auto increment attributes', function() {
    before(function() {
      Self.define('sample2')
        .attr('id', 0, { auto_increment: 1 })
        .attr('title', 'title-%d', { auto_increment: 2 })
        .attr('description', 'using sequence')
        .setParent('sample');
    });

    it('should be shared among children', function(done) {
      let id;
      async.series([
        async function(done) {
          await Self.create('sample2', function(sample) {
            id = sample.id;
            expect(sample).to.have.property('id', id++);
            expect(sample).to.have.property('title', 'title-2');
            done();
          });
        },
        async function(done) {
          await Self.create('sample', function(sample) {
            expect(sample).to.have.property('id', id++);
            expect(sample).to.have.property('foo', 'bar');
            done();
          });
        },
        async function(done) {
          await Self.create('sample2', function(sample) {
            expect(sample).to.have.property('id', id++);
            expect(sample).to.have.property('title', 'title-4');
            done();
          });
        },
        function(done) {
          Self.build('sample2', function(sample) {
            expect(sample).to.have.property('id', id++);
            expect(sample).to.have.property('title', 'title-6');
            done();
          });
        },
        function(done) {
          Self.build('sample', function(sample) {
            expect(sample).to.have.property('id', id++);
            expect(sample).to.have.property('foo', 'bar');
            done();
          });
        },
        async function(done) {
          await Self.create('sample2', function(sample) {
            expect(sample).to.have.property('id', id++);
            expect(sample).to.have.property('title', 'title-8');
            done();
          });
        }
      ], function(err) {
        done(err);
      });
    });

    it('can be overridden', function(done) {
      async.series([
        function(done) {
          Self.build('sample', {id: 99}, function(sample) {
            expect(sample).to.have.property('id', 99);
            done();
          });
        },
        async function(done) {
          await Self.create('sample', {id: 999}, function(sample) {
            expect(sample).to.have.property('id', 999);
            done();
          });
        },
        async function(done) {
          Self.build('sample2', {id: 88}, function(sample) {
            expect(sample).to.have.property('id', 88);
            done();
          });
        },
        async function(done) {
          await Self.create('sample2', {id: 888}, function(sample) {
            expect(sample).to.have.property('id', 888);
            done();
          });
        }
      ], function(err) {
        done(err);
      });
    });
  });
});
