import chai from 'chai';

import { MemoryStorage as Cache } from '../src/index';

const { expect } = chai;

const KEY_1 = 'キー';
const DATA_1 = Object.freeze({
  slang: ['wtf', 'warez', 'ttyl'],
  numbers: ['e', 'pi'],
  times: ['now', 'then']
});

const KEY_2 = '第2のキー';
const DATA_2 = 'just a string'

describe('MemoryStorage Tests', () => {

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Key Level Timeout Set
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  describe('put method with key-level timeouts', function() {

    this.timeout(10000);

    it('with 2 second ttl, data is accessable before timeout', function(done) {
      const key = 'key_2s_timeout';
      const data = { a: 'this is a', b: 'this is b', c: 23 };
      const timeoutSec = 3;
      Cache.put(key, data, timeoutSec);

      setTimeout(function() {
        const data = Cache.get(key);
        expect(data.c).to.equal(23);
        done();
      }, 2000);
    });

    it('with 1 second ttl, data is not accessable after timeout', function(done) {
      const key = 'key_2s_timeout';
      const data = { a: 'this is a', b: 'this is b', c: 23 };
      const timeoutSec = 1;
      Cache.put(key, data, timeoutSec);

      setTimeout(function() {
        const data = Cache.get(key);
        expect(data).to.equal(null);
        done();
      }, 2000);
    });
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // No Timeouts Set
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  describe('ttl-localstorage - no timeouts set', function() {

    beforeEach(function() {
      Cache.put(KEY_1, DATA_1);
      Cache.put(KEY_2, DATA_2);
    });

    afterEach(async function() {
      Cache.removeKey(KEY_1);
      Cache.removeKey(KEY_2);
    })

    describe('get method', () => {
      it('gets object from storage', () => {
        const storedData = Cache.get(KEY_1);
        expect(storedData.times[1]).to.equal('then');
      });
      it('gets string from storage', () => {
        const storedString = Cache.get(KEY_2);
        expect(storedString).to.equal('just a string');
      });
    });

    describe('keys method', () => {
      it('returns a list of keys used in all put operations', () => {
        const keyList = Cache.keys();
        expect(keyList[1]).to.be.equal('第2のキー');
      });
    });

    describe('removeKey and keyExists methods', () => {
      it('removes a key and its associated data (synchronous)', function() {

        let keyList = Cache.keys();
        expect(keyList.length).to.be.equal(2);

        let keyExistsResult = Cache.keyExists(KEY_1)
        expect(keyExistsResult).equals(true);

        Cache.removeKey(KEY_1);
        keyList = Cache.keys();
        expect(keyList.length).equals(1);

        keyExistsResult = Cache.keyExists(KEY_1)
        expect(keyExistsResult).equals(false);
      });
    });
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Top Level Timeout Set
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  describe('given timeoutInSeconds property', () => {
    it('should accept positive integer when setting a value', () => {
      Cache.timeoutInSeconds = 23;
      expect(Cache.timeoutInSeconds).to.equals(23);
    });

    it('should accept null value to effectively disable top level ttl', () => {
      Cache.timeoutInSeconds = null;
      expect(Cache.timeoutInSeconds).to.equals(null);
    });

    it('should throw an exception if unacceptable value', () => {
      expect(() => Cache.timeoutInSeconds = -200).throw();
    });
  });

  describe('put and get methods with top level timeouts', function() {

    this.timeout(10000);

    it('with 3 second ttl, data is available before timeout expires', function(done) {
      const key01 = 'key01';
      Cache.timeoutInSeconds = 3;
      Cache.put(key01, ['Monday', 'Tuesday']);

      setTimeout(function() {
        const data = Cache.get(key01);
        expect(data.length).equals(2);
        done();
      }, 2000);
    });

    it('with 1 second ttl, data is not available after timeout expires', function(done) {
      const key02 = 'key02';
      Cache.timeoutInSeconds = 1;
      Cache.put(key02, ['Monday', 'Tuesday']);

      setTimeout(function() {
        const data = Cache.get(key02);
        expect(data).equals(null);
        done();
      }, 2000);
    });
  });

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Utilities
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  describe('Utilties', function() {
    describe('given runGarbageCollector method', function() {
      this.timeout(10000);
      it('remove only keys that have been expired', function(done) {
        Cache.put('key1', 'data 1 ttl', 1);
        Cache.put('key2', 'data 1 ttl also', 1);
        Cache.put('key3', 'data 20 ttl', 20);
        Cache.put('key4', 'data no expire');

        setTimeout(function() {
          Cache.timeoutInSeconds = null;
          const removedKeys = Cache.runGarbageCollector();
          expect(removedKeys.length).to.equals(2);
          expect(Cache.keyExists('key1')).to.equals(false);
          expect(Cache.keyExists('key2')).to.equals(false);
          expect(Cache.keyExists('key3')).to.equals(true);
          expect(Cache.keyExists('key4')).to.equals(true);
          done();
        }, 3000);
      });
    });

    describe('given isLocalStorageAvailable method in server contexts', () => {
      it('returns false', function() {
        const actualResult = Cache.isLocalStorageAvailable();
        expect(actualResult).to.equals(false);
      });
    })

    describe('given isPositiveInteger method', () => {
      it('should return true if value is a positive integer, false otherwise', () => {
        const items =  [
          { input: 300, expectedResult: true },
          { input: 86400, expectedResult: true },
          { input: 86400.00, expectedResult: true },
          { input: 0, expectedResult: false },
          { input: -100, expectedResult: false },
          { input: '3600', expectedResult: false },
          { input: [100], expectedResult: false },
          { input: { n: 1200 }, expectedResult: false },
          { input: 25.05, expectedResult: false },
          { input: null, expectedResult: false }
        ];

        for (const item of items) {
          const { input, expectedResult } = item;

          // @ts-ignore calling private static method for this test;
          const actualResult = Cache.constructor.isPositiveInteger(input);
          expect (actualResult).to.equals(expectedResult, `input: ${input}`);
        }
      });
    })
  });

});
