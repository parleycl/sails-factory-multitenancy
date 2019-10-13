const _ = require("@sailshq/lodash");

// ███╗   ███╗       ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
// ████╗ ████║       ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
// ██╔████╔██║       █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝ 
// ██║╚██╔╝██║       ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝  
// ██║ ╚═╝ ██║██╗    ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║   
// ╚═╝     ╚═╝╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   

class Factory {

  constructor(name, modelName) {
    const modelId = _.camelCase(modelName).toLowerCase();
    const attrs = {};

    Object.defineProperties(this, {
      name: { value: name },
      modelName: { value: modelName },
      modelId: { value: modelId },
      attrs: { value: attrs }
    });
  }

  //----------------------------------------------------------------------------

  attr(name, value, options) {
    _.set(this.attrs, name, value);
    return this;
  }

  //----------------------------------------------------------------------------

  build(attrs, callback) {
    const _attrs = _.merge({}, this.attrs, attrs);
    const promise = new Promise((resolve, reject) => {
      resolve(_attrs);
    });

    _.isFunction(callback) && callback(_attrs);
    return promise;
  }

  //----------------------------------------------------------------------------

  async create(req, attrs, callback) {
    // Check Sails
    if (typeof sails === "undefined") {
      throw new Error("Sails is not available.");
    }

    const Model = _.get(sails.models, this.modelId);
    if (!Model) {
      throw new Error("Sails model '" + this.modelId + "' is undefined.");
    }

    const _attrs = _.merge({}, this.attrs, attrs);

    //  ██████╗ ██╗   ██╗███████╗██████╗ ██╗   ██╗    ███████╗██╗  ██╗███████╗ ██████╗
    // ██╔═══██╗██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝    ██╔════╝╚██╗██╔╝██╔════╝██╔════╝
    // ██║   ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝     █████╗   ╚███╔╝ █████╗  ██║     
    // ██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝      ██╔══╝   ██╔██╗ ██╔══╝  ██║     
    // ╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║       ███████╗██╔╝ ██╗███████╗╚██████╗██╗
    //  ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝

    let query;
  
    if (req !== null) {
      console.log('asdas');
      query = await Model.create(_attrs);
    } else {
      query = await Model.create(req, _attrs);
    }

    if (_.isFunction(callback)) {
      callback(query);
    }

    return query;
  }
}

module.exports = Factory;
