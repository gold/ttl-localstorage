const BaseApi = require('../common/base-api');

const IS_PERSISENT = true;

class LocalStorage extends BaseApi {
  constructor() {
    super(IS_PERSISENT);
  }
}

module.exports = new LocalStorage();
