import BaseApi from '../common/base-api';

const IS_PERSISENT = false;

class MemoryStorage extends BaseApi {
  constructor() {
    super(IS_PERSISENT);
  }
}

export default new MemoryStorage();
