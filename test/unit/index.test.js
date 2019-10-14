require('node-test-helper');

const path = require('upath');
const Self = require(process.cwd());
const SailsFactory = require(path.join(process.cwd(), 'lib', 'sails-factory'));

describe(TEST_NAME, function() {

  describe('constructor', function() {

    it('should return factory instance', function() {
      var obj = Self;
      expect(obj).to.be.an.instanceof(SailsFactory);
    });

    it('should return factory instance given a name and modelName', function() {
      var obj = new SailsFactory('sample');
      expect(obj).to.be.an.instanceof(SailsFactory);
      expect(obj.modelName).to.equal('sample');
    });
  });
});
