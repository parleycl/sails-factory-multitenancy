// ███████╗ █████╗ ██╗██╗     ███████╗    ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
// ██╔════╝██╔══██╗██║██║     ██╔════╝    ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
// ███████╗███████║██║██║     ███████╗    █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝ 
// ╚════██║██╔══██║██║██║     ╚════██║    ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝  
// ███████║██║  ██║██║███████╗███████║    ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║   
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   

const _ = require('@sailshq/lodash');
const fs = require('fs');
const path = require('upath');
const Factory = require('./factory');
const _datasources = require('sails-hook-multitenant/lib/methods/getdatasources');
const multitenant = require('sails-hook-multitenant');

const factoryMap = new Map();

class SailsFactory {

  constructor(fpath = null) {
    this.loadFactory(fpath);
  }

  // ██╗            ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
  // ██║            ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
  // ██║            █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝ 
  // ██║            ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝  
  // ███████╗██╗    ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║   
  // ╚══════╝╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   

  loadFactory(fpath) {
    if (fpath) {
      const modelName = path.trimExt(path.basename(fpath));

      Object.defineProperties(this, {
        modelName: { value: modelName }
      });

      //-- load factory
      fpath = this.getModelPath(fpath)
      if (fpath) {
        require(fpath)(this);
      }
    }
  }

  //  ██████╗ ███████╗████████╗    ██████╗  █████╗ ████████╗██╗  ██╗
  // ██╔════╝ ██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║
  // ██║  ███╗█████╗     ██║       ██████╔╝███████║   ██║   ███████║
  // ██║   ██║██╔══╝     ██║       ██╔═══╝ ██╔══██║   ██║   ██╔══██║
  // ╚██████╔╝███████╗   ██║       ██║     ██║  ██║   ██║   ██║  ██║
  //  ╚═════╝ ╚══════╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

  getModelPath(factory, required = true) {
    if (!fs.existsSync(factory)) {
      let path = `${process.cwd()}/test/factories/${factory}.js`;
      try {
        if (fs.existsSync(path) && !fs.lstatSync(path).isDirectory()) {
          return path;
        } else {
          if (required) {
            throw new Error("Factory '" + factory + "' not exists.");
          }
          return null;
        }
      } catch(err) {
        if (required) {
          throw new Error("Factory '" + path + "' not exists.");
        }
        return null;
      }
    } else {
      return factory;
    }
  }

  // ██╗      ██████╗  █████╗ ██████╗ 
  // ██║     ██╔═══██╗██╔══██╗██╔══██╗
  // ██║     ██║   ██║███████║██║  ██║
  // ██║     ██║   ██║██╔══██║██║  ██║
  // ███████╗╚██████╔╝██║  ██║██████╔╝
  // ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝

  load(...args) {
    let folder = 'test/factories';
    let callback = null;

    _.each(args, (arg) => {
      _.isString(arg) && (folder = arg);
      _.isFunction(arg) && (callback = arg);
    });

    const dir = path.resolve(folder);
    const files = fs.readdirSync(dir);
    let count = 0;

    _.each(files, (fname) => {
      const fpath = path.join(dir, fname);

      if (/^[^.].*\.js$/.test(fname) && fs.statSync(fpath).isFile()) {
        new SailsFactory(fpath) && ++count;
      }
    });

    callback && callback(count);
    // Return the number if factories loaded
    return count;
  }

  getFactory(name) {
    const factory = factoryMap.get(name);
    if (factory) {
      return factory
    } else {
      return null;
    }
  }

  // ██████╗ ███████╗███████╗██╗███╗   ██╗███████╗
  // ██╔══██╗██╔════╝██╔════╝██║████╗  ██║██╔════╝
  // ██║  ██║█████╗  █████╗  ██║██╔██╗ ██║█████╗  
  // ██║  ██║██╔══╝  ██╔══╝  ██║██║╚██╗██║██╔══╝  
  // ██████╔╝███████╗██║     ██║██║ ╚████║███████╗
  // ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝
  //
  // 1. Instance define
  // 2. Static define

  define(name, modelName) {
    const factory = new Factory(name, (modelName || this.modelName || name), this);
    factoryMap.set(name, factory);
    return factory;
  }

  static define(name, modelName) {
    const factory = new Factory(name, (modelName || name), new SailsFactory());
    factoryMap.set(name, factory);
    return factory;
  }

  // ██████╗ ██╗   ██╗██╗██╗     ██████╗ 
  // ██╔══██╗██║   ██║██║██║     ██╔══██╗
  // ██████╔╝██║   ██║██║██║     ██║  ██║
  // ██╔══██╗██║   ██║██║██║     ██║  ██║
  // ██████╔╝╚██████╔╝██║███████╗██████╔╝
  // ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ 
  //
  //  1. Instance build
  //  2. Static build


  build(name, ...args) {
    let attrs = {};
    let callback = null;

    _.each(args, (arg) => {
      _.isPlainObject(arg) && (attrs = arg);
      _.isFunction(arg) && (callback = arg);
    });

    const factory = factoryMap.get(name);
    if (!factory) {
      throw new Error("Factory '" + name + "' is undefined.");
    }

    return factory.build(attrs, callback);
  }

  static build(name, attrs, callback) {
    if (_.isFunction(attrs)) {
      callback = attrs;
      attrs = {};
    }

    const sFactory = new SailsFactory();
    const factory = sFactory.getFactory(name);
    
    if (!factory) {
      const path = sFactory.getModelPath(name);
      sFactory.loadFactory(path);
      factory = sFactory.getFactory(name);
    }    
    
    return factory.build(attrs, callback);
  }

  //  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
  // ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
  // ██║     ██████╔╝█████╗  ███████║   ██║   █████╗  
  // ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝  
  // ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
  //  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //
  // 1. Instance create
  // 2. Static create

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
        modelName = (factoryMap.get(genArgs[0]).parent) ?
          factoryMap.get(genArgs[0]).parent.modelId :
          factoryMap.get(genArgs[0]).modelId;
      } else if (factoryMap.get(genArgs[1])) {
        modelName = (factoryMap.get(genArgs[1]).parent) ?
          factoryMap.get(genArgs[1]).parent.modelId :
          factoryMap.get(genArgs[1]).modelId;
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

    _.each(args, (arg) => {
      _.isPlainObject(arg) && (attrs = arg);
      _.isFunction(arg) && (callback = arg);
    });

    if (ignore_tenancy) {
      return factory.create(null, attrs, callback);
    } else {
      return factory.create(req, attrs, callback);
    }
  }
  // End Instance create

  static create(name, ...args) {
    const sFactory = new SailsFactory();
    let model;

    let factory = sFactory.getFactory(arguments[0]) || sFactory.getFactory(arguments[1]);

    if (!factory) {
      if (sFactory.getModelPath(arguments[0])) {
        sFactory.loadFactory(arguments[0]);
        model = arguments[0];
      } else if (sFactory.getModelPath(arguments[1])) {
        sFactory.loadFactory(arguments[1]);
        model = arguments[1];
      } else {
        throw new Error("Factory '" + name + "' is undefined.");
      }
    }

    return sFactory.create.apply(sFactory, arguments);
  }
  // End Static create
}

module.exports = SailsFactory;
