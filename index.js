/**
 * SailsFactory
 *
 */

const _ = require("@sailshq/lodash");
const fs = require("fs");
const path = require("upath");
const Factory = require(path.normalizeSafe("./lib/factory"));
const _datasources = require('sails-hook-multitenant/lib/methods/getdatasources');
const multitenant = require('sails-hook-multitenant');

const factoryMap = new Map();

//==============================================================================

class SailsFactory {

  constructor(fpath = "", sails = null) {
    const modelName = path.trimExt(path.basename(fpath));

    Object.defineProperties(this, {
      modelName: { value: modelName }
    });

    //-- load factory
    if (fpath) {
      require(fpath)(this);
    }
  }

  //----------------------------------------------------------------------------

  load(...args) {
    let folder = "test/factories";
    let callback = null;

    _(args).each((arg) => {
      _.isString(arg) && (folder = arg);
      _.isFunction(arg) && (callback = arg);
    });

    const dir = path.resolve(folder);
    const files = fs.readdirSync(dir);
    let count = 0;

    _.forEach(files, (fname) => {
      const fpath = path.join(dir, fname);

      if (/^[^.].*\.js$/.test(fname) && fs.statSync(fpath).isFile()) {
        new SailsFactory(fpath) && ++count;
      }
    });

    callback && callback(count);
  }

  //----------------------------------------------------------------------------

  define(name, modelName) {
    const factory = new Factory(name, (modelName || this.modelName || name));

    factoryMap.set(name, factory);
    return factory;
  }

  //----------------------------------------------------------------------------

  build(name, ...args) {
    let attrs = {};
    let callback = null;

    _(args).each((arg) => {
      _.isPlainObject(arg) && (attrs = arg);
      _.isFunction(arg) && (callback = arg);
    });

    const factory = factoryMap.get(name);
    if (!factory) {
      throw new Error("Factory '" + name + "' is undefined.");
    }

    return factory.build(attrs, callback);
  }

  //----------------------------------------------------------------------------

  async create(name, ...args) {

    // ████████╗███████╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗██╗   ██╗    ██████╗ ███████╗   
    // ╚══██╔══╝██╔════╝████╗  ██║██╔══██╗████╗  ██║██╔════╝╚██╗ ██╔╝    ██╔══██╗██╔════╝   
    //    ██║   █████╗  ██╔██╗ ██║███████║██╔██╗ ██║██║      ╚████╔╝     ██║  ██║█████╗     
    //    ██║   ██╔══╝  ██║╚██╗██║██╔══██║██║╚██╗██║██║       ╚██╔╝      ██║  ██║██╔══╝     
    //    ██║   ███████╗██║ ╚████║██║  ██║██║ ╚████║╚██████╗   ██║       ██████╔╝███████╗██╗
    //    ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝       ╚═════╝ ╚══════╝╚═╝
    var ignore_tenancy = true;

    if (multitenant) {
      var genArgs = Array.from(arguments);
      var req;
      var modelName;

      // Determine if factory exists based on tenancy posible request
      if (factoryMap.get(genArgs[0])) {
        modelName = factoryMap.get(genArgs[0]).modelId;
      } else if (factoryMap.get(genArgs[1])) {
        modelName = factoryMap.get(genArgs[1]).modelId;
      } else {
        throw new Error("Factory '" + name + "' is undefined.");
      }

      // Define datasource
      let datasources;

      if (sails.models[modelName]) {
        datasources = _datasources(sails.models[modelName]);
      } else {
        throw new Error("Model '" + modelName + "' is not a sails model.");
      }

      // ████████╗███████╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗██╗   ██╗    ██████╗ ██╗███████╗   
      // ╚══██╔══╝██╔════╝████╗  ██║██╔══██╗████╗  ██║██╔════╝╚██╗ ██╔╝    ██╔══██╗██║██╔════╝   
      //    ██║   █████╗  ██╔██╗ ██║███████║██╔██╗ ██║██║      ╚████╔╝     ██║  ██║██║███████╗   
      //    ██║   ██╔══╝  ██║╚██╗██║██╔══██║██║╚██╗██║██║       ╚██╔╝      ██║  ██║██║╚════██║   
      //    ██║   ███████╗██║ ╚████║██║  ██║██║ ╚████║╚██████╗   ██║       ██████╔╝██║███████║██╗
      //    ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝       ╚═════╝ ╚═╝╚══════╝╚═╝
      // Tenancy discrimination and arguments settings

      if (typeof genArgs[0] === 'string' || typeof genArgs[0] === 'object') {
        if (typeof genArgs[0] === 'string' && 
          datasources.searchStringIdentity(genArgs[0])) {
          req = genArgs[0];
          name = genArgs[1];
          args.splice(0, 1);
          ignore_tenancy = false;
        } else if (typeof genArgs[0] === 'object' &&
          (genArgs[0].constructor.name === 'IncomingMessage' ||
            genArgs[0].constructor.name === 'DataStoreConfig')) {
          req = genArgs[0];
          name = genArgs[1];
          args.splice(0, 1);
          ignore_tenancy = false;
        }
      }
    }

    const factory = factoryMap.get(name);
    if (!factory) {
      throw new Error("Factory '" + name + "' is undefined.");
    }

    let attrs = {};
    let callback = null;

    _(args).each((arg) => {
      _.isPlainObject(arg) && (attrs = arg);
      _.isFunction(arg) && (callback = arg);
    });

    if (ignore_tenancy) {
      return factory.create(null, attrs, callback);
    } else {
      return factory.create(req, attrs, callback);
    }
  }
}

module.exports = new SailsFactory();
