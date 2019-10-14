require('node-test-helper');
const _ = require('@sailshq/lodash');
const async = require('async');
const path = require('upath');
const Self = require(path.join(process.cwd(), 'lib', 'factory'));

describe(TEST_NAME, function() {
  describe('constructor', function() {
    it('should return instance given a name and a model name', function() {
      const obj = new Self('sample', 'sampleModel');
      expect(obj).to.be.an.instanceof(Self);
      expect(obj).to.have.property('name', 'sample');
      expect(obj).to.have.property('modelName', 'sampleModel');
      expect(obj).to.have.property('modelId', 'samplemodel');
      expect(obj).to.have.property('attrs').that.is.an('object');
    });

    it('should transform modelName into a modelId format', function() {
      new Self('sample', 'samplemodel').should.have.property('modelId', 'samplemodel');
      new Self('sample', 'sampleModel').should.have.property('modelId', 'samplemodel');
      new Self('sample', 'SampleModel').should.have.property('modelId', 'samplemodel');
      new Self('sample', 'sample_model').should.have.property('modelId', 'samplemodel');
      new Self('sample', 'sample-model').should.have.property('modelId', 'samplemodel');
      new Self('sample', 'sample model').should.have.property('modelId', 'samplemodel');
    });
  });

  describe('#attr()', function() {
    it('should set attribute', function() {
      const attr_key = 'foo';
      const attr_val = 'bar';
      const obj = new Self('sample').attr(attr_key, attr_val);
      expect(obj.attrs).to.have.property(attr_key, attr_val);
    });

    it('could be chained', function() {
      const obj = new Self();
      expect(obj.attr('foo1', 'bar1')).to.be.an.instanceof(Self);
      obj.attr('foo2', 'bar2').attr('foo3', 'bar3');
      expect(obj.attrs).to.have.property('foo1', 'bar1');
      expect(obj.attrs).to.have.property('foo2', 'bar2');
      expect(obj.attrs).to.have.property('foo3', 'bar3');
    });
  });

  describe('Use build method', function() {
    describe('with callback', function() {
      it('should return a promise instance', function(done) {
        const obj = new Self();
        const attrs = {'foo': 'baz'};
        const res = obj.build(attrs, _.noop);

        expect(res).to.be.an.instanceof(Promise);
        res.then(_attrs => {
          expect(_attrs).eql(attrs);
          done();
        });
      });

      it('should execute the callback', function(done) {
        const spy = sinon.spy(function(attrs) {});
        const attrs = {'foo': 'baz'};

        const obj = new Self();
        const res = obj.build(attrs, spy);
        expect(res).to.be.an.instanceof(Promise);
        expect(spy.calledOnce);
        expect(spy.firstCall.args[0]).eql(attrs);
        done();
      });

      it('should return an object instance of a new factory', function(done) {
        new Self().build({
          'foo': 'bar',
          'hello': 'ok'
        }, function(sample) {
          expect(sample).to.have.property('foo', 'bar');
          expect(sample).to.have.property('hello', 'ok');
          done();
        });
      });
    });
  });

  describe('Use create method', function() {
    let factory;
    before(function() {
      factory = new Self('sample', 'sample')
      .attr('foo', 'bar')
      .attr('hello', 'ok')
    });

    describe('With callback', function() {
      it('should return a model instance of a defined factory', async function(done) {
        await factory.create(null, {}, function(sample) {
          expect(sample).to.have.property('id');
          expect(sample).to.have.property('foo', 'bar');
          expect(sample).to.have.property('hello', 'ok');
          done();
        });
      });
  
      it('should return a model instance of a defined factory with overridden attributes', async function(done) {
        await factory.create(null, { foo: 'hello' }, function(sample) {
          expect(sample).to.have.property('id');
          expect(sample).to.have.property('foo', 'hello');
          expect(sample).to.have.property('hello', 'ok');
          done();
        });
      });
    });
    
    describe('Without callback', function(){
      it('should return a model instance of a defined factory with overridden attributes', async function(done) {
        let sample = await factory.create(null, {});
        expect(sample).to.have.property('id');
        expect(sample).to.have.property('foo', 'bar');
        expect(sample).to.have.property('hello', 'ok');
        done();
      });

      it('should return a model instance of a defined factory with overridden attributes', async function(done) {
        let sample = await factory.create(null, { foo: 'hello' });
        expect(sample).to.have.property('id');
        expect(sample).to.have.property('foo', 'hello');
        expect(sample).to.have.property('hello', 'ok');
        done();
      });
    });
  });
});
