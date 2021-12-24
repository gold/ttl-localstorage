import { BaseStorageApi } from '../common/base-api';

const IS_PERSISENT = true;

class LocalStorage extends BaseStorageApi {
  constructor() {
    super(IS_PERSISENT);
  }
}

const ls = new LocalStorage();
export {
  ls as LocalStorage
}
