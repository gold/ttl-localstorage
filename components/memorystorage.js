const BaseApi = require('../common/base-api');

const IS_PERSISENT = false;

class MemoryStorage extends BaseApi {
  constructor() {
    super(IS_PERSISENT);
  }
}

module.exports = new MemoryStorage();
