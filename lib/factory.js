const _ = require('@sailshq/lodash');

// ███╗   ███╗       ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
// ████╗ ████║       ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
// ██╔████╔██║       █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝ 
// ██║╚██╔╝██║       ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝  
// ██║ ╚═╝ ██║██╗    ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║   
// ╚═╝     ╚═╝╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   

class Factory {

  constructor(name, modelName, sFactory = null) {
    const modelId = _.camelCase(modelName).toLowerCase();
    this.oParent = null;
    const attrs = {};

    Object.defineProperties(this, {
      name: { value: name },
      modelName: { value: modelName },
      modelId: { value: modelId },
      sFactory: { value: sFactory },
      attrs: { value: attrs }
    });
  }

  // ███████╗        █████╗ ████████╗████████╗██████╗ ██╗██████╗ ██╗   ██╗████████╗███████╗███████╗
  // ██╔════╝       ██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██║██╔══██╗██║   ██║╚══██╔══╝██╔════╝██╔════╝
  // ███████╗       ███████║   ██║      ██║   ██████╔╝██║██████╔╝██║   ██║   ██║   █████╗  ███████╗
  // ╚════██║       ██╔══██║   ██║      ██║   ██╔══██╗██║██╔══██╗██║   ██║   ██║   ██╔══╝  ╚════██║
  // ███████║██╗    ██║  ██║   ██║      ██║   ██║  ██║██║██████╔╝╚██████╔╝   ██║   ███████╗███████║
  // ╚══════╝╚═╝    ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚══════╝

  attr(name, value, options) {
    if (options) {
      value = _.merge({}, options, { value: value });
    }

    _.set(this.attrs, name, value);
    return this;
  }

  // ██████╗ ██╗   ██╗██╗██╗     ██████╗ 
  // ██╔══██╗██║   ██║██║██║     ██╔══██╗
  // ██████╔╝██║   ██║██║██║     ██║  ██║
  // ██╔══██╗██║   ██║██║██║     ██║  ██║
  // ██████╔╝╚██████╔╝██║███████╗██████╔╝
  // ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ 

  build(attrs, callback) {
    const attrSet = this.processData(this.attrs);
    const _attrs = _.merge({}, attrSet, attrs);

    const promise = new Promise((resolve, reject) => {
      resolve(_attrs);
    });

    _.isFunction(callback) && callback(_attrs);

    this.updateData();

    return promise;
  }

  // ███████╗███████╗████████╗    ██████╗  █████╗ ██████╗ ███████╗███╗   ██╗████████╗
  // ██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗██╔══██╗██╔════╝████╗  ██║╚══██╔══╝
  // ███████╗█████╗     ██║       ██████╔╝███████║██████╔╝█████╗  ██╔██╗ ██║   ██║   
  // ╚════██║██╔══╝     ██║       ██╔═══╝ ██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║   ██║   
  // ███████║███████╗   ██║       ██║     ██║  ██║██║  ██║███████╗██║ ╚████║   ██║   
  // ╚══════╝╚══════╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝  

  parent(factory) {
    if (this.sFactory) {
      const parent = this.sFactory.getFactory(factory);
      if (parent) {
        this.oParent = parent;
      }
    } else {
      throw new Error("No Sails Factory defined in constructor");
    }
  }

  // ██████╗  █████╗ ████████╗ █████╗     ███╗   ███╗███████╗████████╗██╗  ██╗ ██████╗    
  // ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗    ████╗ ████║██╔════╝╚══██╔══╝██║  ██║██╔═══██╗   
  // ██║  ██║███████║   ██║   ███████║    ██╔████╔██║█████╗     ██║   ███████║██║   ██║   
  // ██║  ██║██╔══██║   ██║   ██╔══██║    ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║   ██║   
  // ██████╔╝██║  ██║   ██║   ██║  ██║    ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║╚██████╔╝██╗
  // ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝
  //
  // 1. processData
  // 2. updateData
  // 3. updateId

  processData(attrs) {
    if (this.oParent) {
      let idP = this.oParent.attrs.id;
      attrs = _.merge({}, this.oParent.attrs, attrs);
      attrs.id = idP;
    }

    let attributes = {};
    _.each(attrs, (attr, key) => {
      if (typeof attr === 'object') {
        let value = attr.value;
        let counter = attr.counter || 0;
        let increment = (attr.auto_increment && 
          typeof attr.auto_increment === 'boolean') ?
          1 : attr.auto_increment;
        if (increment) {
          counter += increment;
          if (typeof value === 'string') {
            value = value.replace('%d', counter);
            if (attr.value === value) {
              value = value + counter;
            }
          } else if (typeof value === 'number'){
            value += counter; 
          }
        }
        attributes[key] = value;
      } else if (typeof attr === 'function') {
        attributes[key] = attr();
      } else {
        attributes[key] = attr;
      }
    });
    
    return attributes
  }

  updateData(query, oAttrs, parent) {
    let attributes = oAttrs || this.attrs;
    _.each(attributes, (attr, key) => {
      if (key === 'id' && typeof attributes[key] === 'object') {
        this.updateId(query, attributes, parent);
        return;
      }

      if (typeof attr === 'object' &&  this.attrs[key]) {
        let counter = attr.counter || 0;
        let increment = (attr.auto_increment && 
          typeof attr.auto_increment === 'boolean') ?
          1 : attr.auto_increment;
        if (increment) {
          counter += increment;
          this.attrs[key].counter = counter;
        }
      }
      
    });
    
    if (this.oParent) {
      this.oParent.updateData(null, this.attrs, true);
    }
  }

  updateId(query, attributes, parent) {
    // Check id value exists
    if (!this.attrs.id) {
      this.attrs.id = {
        value: 0,
        counter: 0,
        auto_increment: 1
      };
    }

    let increment = (!parent) ? this.attrs.id.auto_increment : 0;
    if (increment && typeof increment === 'boolean') {
      increment = 1;
    }

    // Update id value
    this.attrs.id.value = (query && query.id) ? query.id 
      : attributes.id.value + increment;
  }

  //  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
  // ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
  // ██║     ██████╔╝█████╗  ███████║   ██║   █████╗  
  // ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝  
  // ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
  //  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

  async create(req, attrs, callback) {

    // Check Sails
    if (typeof sails === "undefined") {
      throw new Error("Sails is not available.");
    }
    
    const Model = (!this.oParent) ? 
      _.get(sails.models, this.modelId) :
      _.get(sails.models, this.oParent.modelId);
      
    if (!Model) {
      throw new Error("Sails model '" + this.modelId + "' is undefined.");
    }

    const attrSet = this.processData(this.attrs);
    if (!this.attrs.id) {
      delete attrSet.id;
    }

    const _attrs = _.merge({}, attrSet, attrs);
    

    //  ██████╗ ██╗   ██╗███████╗██████╗ ██╗   ██╗    ███████╗██╗  ██╗███████╗ ██████╗
    // ██╔═══██╗██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝    ██╔════╝╚██╗██╔╝██╔════╝██╔════╝
    // ██║   ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝     █████╗   ╚███╔╝ █████╗  ██║     
    // ██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝      ██╔══╝   ██╔██╗ ██╔══╝  ██║     
    // ╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║       ███████╗██╔╝ ██╗███████╗╚██████╗██╗
    //  ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝

    let query;

    if (req === null) {
      query = await Model.create(_attrs).fetch();
    } else {
      query = await Model.create(req, _attrs).fetch();
    }

    if (query) {
      this.updateData(query);
    }

    if (_.isFunction(callback)) {
      callback(query);
    }

    return query;
  }
}

module.exports = Factory;
