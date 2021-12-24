import { BaseStorageApi } from '../common/base-api';

const IS_PERSISENT = false;

class MemoryStorage extends BaseStorageApi {
  constructor() {
    super(IS_PERSISENT);
  }
}

const ms = new MemoryStorage();
export {
  ms as MemoryStorage
}
