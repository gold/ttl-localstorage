import Promise from 'bluebird';

export default class BaseApi {
  constructor(persistent) {
    this.persistent = persistent;

    // for MemoryStorage
    this._lootBag = {};

    // by default there is no _timeout
    this._timeout = null;
  }

  set timeoutInSeconds(timeInSeconds) {
    this._timeout = timeInSeconds;
  }

  get timeoutInSeconds() {
    return this._timeout;
  }

  // If key does not exist:
  //   if 2nd arg is passed, i.e., default is defined, return default
  //   if 2nd arg is not passed, return null
  get(key, defaultValue = null) {
    return new Promise((resolve) => {
      if (this.persistent) { // local storage
        if (key in localStorage) {
          const obj = JSON.parse(localStorage.getItem(key));

          if (this._timeout === null) {
            resolve(obj.v);
          } else {
            if (this._isCacheStale(obj.t)) {
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
          if (this._timeout === null) {
            resolve(this._lootBag[key].v);
          } else {
            if (this._isCacheStale(this._lootBag[key].t)) {
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

  put(key, val) {
    return new Promise((resolve) => {
      const item = {v: val, t: this._getNow()};
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
          if (this._timeout === null) {
            resolve(true);
          } else {
            const obj = JSON.parse(localStorage.getItem(key));
            if (this._isCacheStale(obj.t)) {
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
          if (this._timeout === null) {
            resolve(true);
          } else {
            if (this._isCacheStale(this._lootBag[key].t)) {
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

   _isCacheStale(timestamp) {
     return (this._getNow() - timestamp) > this._timeout;
   }

}
