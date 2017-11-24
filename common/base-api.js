import Promise from 'bluebird';

export default class BaseApi {
  constructor(persistent) {
    this.persistent = persistent;

    // for MemoryStorage
    this._lootBag = {};

    // by default there is no general timeout for all keys
    this._timeout = null;
  }

  // general timeout: this applies to all keys put without a specific timeout.
  set timeoutInSeconds(timeInSeconds) {
    this._timeout = timeInSeconds;
  }

  get timeoutInSeconds() {
    return this._timeout;
  }

  // If key does not exist:
  //   if 2nd arg is passed, i.e., default is defined, return default
  //   if 2nd arg is not passed, return null
  //
  // Note: "kt" property is the key-based timeout (in seconds), optionally sent
  // to put method.
  get(key, defaultValue = null) {
    return new Promise((resolve) => {
      if (this.persistent) { // local storage
        if (key in localStorage) {
          const obj = JSON.parse(localStorage.getItem(key));

          if (this._timeout === null && obj.kt === null) {
            resolve(obj.v);
          } else {
            if (this._isCacheStale(obj)) {
              this.removeKey(key).then(() => {
                resolve(defaultValue);
              })
            } else {
              resolve(obj.v);
            }
          }
        } else {
          resolve(defaultValue);
        }
      } else { // in memory
        if (key in this._lootBag) {
          if (this._timeout === null && this._lootBag.kt === null) {
            resolve(this._lootBag[key].v);
          } else {
            if (this._isCacheStale(this._lootBag[key])) {
              this.removeKey(key).then(() => {
                resolve(defaultValue);
              });
            } else {
              resolve(this._lootBag[key].v);
            }
          }
        } else {
          resolve(defaultValue);
        }
      }
    });
  }

  // keyTimeout is optional. If passed in, its value overrides general
  // timeoutInSeconds setting.
  put(key, val, keyTimeout = null) {
    return new Promise((resolve) => {
      const item = {v: val, t: this._getNow(), kt: keyTimeout};

      if (this.persistent) {
        localStorage.setItem(key, JSON.stringify(item));
        resolve();
      } else {
        this._lootBag[key] = item;
        resolve();
      }
    });
  }

  removeKey(key) {
    return new Promise((resolve) => {
      if (this.persistent) {
        if (key in localStorage) {
          localStorage.removeItem(key);
        }
      } else {
        if (key in this._lootBag) {
          delete this._lootBag[key];
        }
      }
      resolve();
    });
  }

  // If a TTL is set and the key has expired, its existence is set free. :)
  keyExists(key) {
    return new Promise((resolve) => {
      if (this.persistent) { // local storage
        if (key in localStorage) {
          const obj = JSON.parse(localStorage.getItem(key));
          if (this._timeout === null && obj.kt === null) {
            resolve(true);
          } else {
            if (this._isCacheStale(obj)) {
              this.removeKey(key).then(() => {
                resolve(false);
              });
            } else {
              resolve(true);
            }
          }
        } else {
          resolve(false);
        }
      } else { // in memory
        if (key in this._lootBag) {
          if (this._timeout === null && this._lootBag.kt === null) {
            resolve(true);
          } else {
            if (this._isCacheStale(this._lootBag[key])) {
              resolve(false);
              this.removeKey(key).then(() => {
              });
            } else {
              resolve(true);
            }
          }
        } else {
          resolve(false);
        }
      }
    });
  }

  clear() {
    return new Promise((resolve) => {
      if (this.persistent) {
        localStorage.clear();
        resolve();
      } else {
        this._lootBag = {};
        resolve();
      }
    });
   }

   keys() {
     return new Promise((resolve) => {
       if (this.persistent) {
         resolve(Object.keys(localStorage));
       } else {
         resolve(Object.keys(this._lootBag));
       }
     });
   }

   isLocalStorageAvailable() {
     return new Promise((resolve) => {
       const key = new Date().getTime().toString();
       const val = key;

       try {
         localStorage.setItem(key, val);
         localStorage.removeItem(key);
         resolve(true);
       } catch(ex) {
         resolve(false);
       }
     });
   }

  _getNow() {
    return parseInt(Date.now() / 1000, 10);
   }

   // This method is called only when at least one of the timeouts has been set.
   // key timeout has priority. general this._timeout is used only if key
   // timeout hasn't been set.
   _isCacheStale(obj) {
     const timestamp = obj.t;
     const timeout = obj.kt === null ? this._timeout : obj.kt;
     return (this._getNow() - timestamp) > timeout;
   }

}
