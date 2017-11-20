import BaseApi from '../common/base-api';

const IS_PERSISENT = true;

class LocalStorage extends BaseApi {
  constructor() {
    super(IS_PERSISENT);
  }
}

export default new LocalStorage();
