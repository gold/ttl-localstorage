import chai from 'chai';

import { LocalStorage as Cache } from '../src/index';

const { expect } = chai;

const KEY_1 = 'キー';
const DATA_1 = Object.freeze({
  slang: ['wtf', 'warez', 'ttyl'],
  numbers: ['e', 'pi'],
  times: ['now', 'then']
});

const KEY_2 = '第2のキー';
const DATA_2 = 'just a string'

describe('LocalStorage', () => {

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

});
