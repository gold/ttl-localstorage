import { TTL, GetValue } from '../types';

class BaseStorageApi {
  private _lootBag: GetValue = {};

  // By default no TTL is set
  private _ttl: TTL = null;
  constructor(private persistent: boolean) {}

  /**
  * @public
  * @param ttlValue - number of seconds to set. applies to all
  *                   keys that don't have a key-leve ttl set.
  */
  public set timeoutInSeconds(ttlValue: TTL) {
    if (BaseStorageApi.isPositiveInteger(ttlValue)) {
      this._ttl = ttlValue;
    } else {
      throw new Error(`'${ttlValue}' is not a positive integer required when setting the top-level TTL`);
    }
  }

  /**
  * @public
  * @returns ttl in seconds which applies to all keys that don't
  *          have a key-level ttl set.
  */
  public get timeoutInSeconds(): TTL {
    return this._ttl;
  }

  /**
  * @public
  * @param key - name of key
  * @param val - data to be stored
  * @param keyTimeout - optional key-level ttl in seconds. The key level
  *                     ttl overrides the global ttl if it had been set.
  */
  public put(key: string, val: any, keyTimeout: TTL = null): void {
    if (keyTimeout !== null && !BaseStorageApi.isPositiveInteger(keyTimeout)) {
      throw new Error(`'${keyTimeout}' is not a positive integer required when setting a key-level TTL`);
    }

    const item = { v: val, t: this._getNow(), kt: keyTimeout };
    if (this.persistent) {
      localStorage.setItem(key, JSON.stringify(item));
    } else {
      this._lootBag[key] = item;
    }
  }

  /**
  * @public
  * @param key - key to access stored data
  * @param defaultValue - optional data if key does not exist.
  * @returns any or null
  */
  public get(key: string, defaultValue: GetValue = null): GetValue {
    if (this.persistent) { // local storage
      if (key in localStorage) {
        const val: GetValue = localStorage.getItem(key);

        try {
          const obj = JSON.parse(val);

          if (this._ttl === null && obj.kt === null) {
            return obj.v;
          } else {
            if (this._isCacheStale(obj)) {
              this.removeKey(key);
              return defaultValue;
            } else {
              return obj.v;
            }
          }
        } catch (e) {
          // Invalid JSON format retrieved from localStorage. Per developers'
          // concensus, it was considered better to not throw in this case and
          // instead return either whatever was found in localStorage or the
          // default value.
          return defaultValue === null ? val : defaultValue;
        }
      } else {
        return defaultValue;
      }
    } else { // in memory
      if (key in this._lootBag) {
        const obj = this._lootBag[key];
        if (this._ttl === null && obj.kt === null) {
          return obj.v;
        } else {
          if (this._isCacheStale(obj)) {
            this.removeKey(key);
            return defaultValue;
          } else {
            return obj.v;
          }
        }
      } else {
        return defaultValue;
      }
    }
  }

  /**
  * @public
  * @param key
  */
  public removeKey(key: string): void {
    if (this.persistent) {
      if (key in localStorage) {
        localStorage.removeItem(key);
      }
    } else {
      if (key in this._lootBag) {
        delete this._lootBag[key];
      }
    }
  }

  /**
  * @public
  * @param key - key used to store data
  * @returns true if key exists and not stale, false otherwise
  */
  public keyExists(key: string): boolean {
    if (this.persistent) { // local storage
      if (key in localStorage) {
        const val: any = localStorage.getItem(key);

        try {
          const obj = JSON.parse(val);
          if (this._ttl === null && obj.kt === null) {
            return true;
          } else {
            if (this._isCacheStale(obj)) {
              this.removeKey(key);
              return false;
            } else {
              return true;
            }
          }
        } catch (e) {
          return true;
        }
      } else {
        return false;
      }
    } else { // in memory
      if (key in this._lootBag) {
        const obj = this._lootBag[key];
        if (this._ttl === null && obj.kt === null) {
          return true;
        } else {
          if (this._isCacheStale(obj)) {
            this.removeKey(key);
            return false;
          } else {
            return true;
          }
        }
      } else {
        return false;
      }
    }
  }

  /**
  * Remove all keys in storage
  * @public
  */
  public clear(): void {
    if (this.persistent) {
      localStorage.clear();
    } else {
      this._lootBag = {};
    }
  }

  /**
   * @public
   * @returns list of keys
   */
  public keys(): string[] {
    return this.persistent ? Object.keys(localStorage) : Object.keys(this._lootBag);
  }

  /**
  * Remove keys that are detected to be stale. Leave other keys intact. This
  * method is executed only if invoked by an explicit call by the developer who
  * uses this library; it is not an automatic garbage collector mechanism.
  * @public
  * @returns list of keys that were deleted
  */
  public runGarbageCollector(): string[] {
    const garbageKeys = [];

    if (this.persistent) {
      for (const key of Object.keys(localStorage)) {
        const val: any = localStorage.getItem(key);

        try {
          const obj: GetValue = JSON.parse(val);

          if (!('v' in obj && 't' in obj && 'kt' in obj)) {
            // This object not stored via this module. leave it alone.
            continue;
          }

          if (!(this._ttl === null && obj.kt === null)) {
            if (this._isCacheStale(obj)) {
              localStorage.removeItem(key);
              garbageKeys.push(key);
            }
          }
        } catch (e) {
          // skip this item
        }
      }
    } else {
      for (const key of Object.keys(this._lootBag)) {
        if (!(this._ttl === null && this._lootBag[key].kt === null)) {
          if (this._isCacheStale(this._lootBag[key])) {
            delete this._lootBag[key];
            garbageKeys.push(key);
          }
        }
      }
    }

    return garbageKeys;
  }

  /**
  * @private
  * @returns unix time
  */
  private _getNow(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
  * This method is called only when at least one of the timeouts has been set.
  * key timeout has priority. global this._ttl is used only if a key-level
  * timeout hasn't been set.
  *
  * @private
  * @param obj - retrieved data from storage
  * @returns true if key is stale, false otherwise
  */
  private _isCacheStale(obj: any): boolean {
     const timestamp = obj.t;
     const timeout = obj.kt === null ? this._ttl : obj.kt;
     return (this._getNow() - timestamp) > timeout;
  }

  /**
  * @private
  * @param n - ostensibly a positive integer
  * @returns true if a positive integer, false otherwise
  */
  private static isPositiveInteger(n: TTL): boolean {
    return typeof n === 'number'
      && isFinite(n)
      && Math.floor(n) === n
      && n > 0;
  }
}

export {
  BaseStorageApi
}
