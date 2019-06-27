const expect = require('chai').expect;
const { MemoryStorage } = require('../index');

const KEY_1 = 'キー';
const DATA_1 = {
  slang: ['wtf', 'warez', 'ttyl'],
  numbers: ['e', 'pi'],
  times: ['now', 'then']
};

const KEY_2 = '第2のキー';
const DATA_2 = 'just a string'

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Key Level Timeouts Set
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
describe('ttl-localstorage - key-level timeout set', function() {

  describe('#put with 2 second ttl', function() {
    const key = 'key_2s_timeout';
    const data = { a: 'this is a', b: 'this is b', c: 23 };
    const timeoutSec = 3;
    MemoryStorage.put(key, data, timeoutSec);

    it('data is accessable before key timeout but not after', function() {
      setTimeout(function() {
        MemoryStorage.synchronous = false;

        MemoryStorage.get(key).then(function(data) {
          expect(data.c === 23).to.be.equal(true);
        });
      }, 2000);

      setTimeout(function() {
        MemoryStorage.synchronous = false;

        MemoryStorage.get(key).then(function(data) {
          expect(data).to.be.equal(null);
        });
      }, 4000);
    })
  });
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// No Timeouts Set
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
describe('ttl-localstorage - no timeouts set', function() {

  beforeEach(async function() {
    await MemoryStorage.put(KEY_1, DATA_1);
    await MemoryStorage.put(KEY_2, DATA_2);
  });

  afterEach(async function() {
    MemoryStorage.removeKey(KEY_1);
    MemoryStorage.removeKey(KEY_2);
  })

  describe('#get', function() {
    it('gets object from storage', async function() {
      MemoryStorage.synchronous = false;

      const storedData = await MemoryStorage.get(KEY_1);
      expect(storedData.times[1]).to.equal('then');
    });
    it('gets string from storage', async function() {
      MemoryStorage.synchronous = false;

      const storedString = await MemoryStorage.get(KEY_2);
      expect(storedString).to.equal('just a string');
    });
  });

  describe('#keys', function() {
    it('returns a list of keys used in all put operations', async function() {
      MemoryStorage.synchronous = false;

      const keyList = await MemoryStorage.keys();
      expect(keyList[2]).to.be.equal('第2のキー');
    });
  });

  describe('#removeKey and #keyExists', function() {
    it('removes a key and its associated data (synchronous)', function() {
      MemoryStorage.synchronous = true;

      let keyList = MemoryStorage.keys();
      expect(keyList.length).to.be.equal(3);

      let keyExistsResult = MemoryStorage.keyExists(KEY_1)
      expect(keyExistsResult).to.equal(true);

      MemoryStorage.removeKey(KEY_1);
      keyList = MemoryStorage.keys();
      expect(keyList.length).to.be.equal(2);

      keyExistsResult = MemoryStorage.keyExists(KEY_1)
      expect(keyExistsResult).to.equal(false);
    });
  });
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Top Level Timeout Set
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
describe('#put and #get with top level timeout', function() {
  it('data is available before timeout expires and not after', async function() {
    const key01 = 'key01';
    MemoryStorage.timeoutInSeconds = 3;
    MemoryStorage.put(key01, ['Monday', 'Tuesday']);

    setTimeout(function() {
      MemoryStorage.get(key01).then(function(data) {
        expect(data.length === 2).to.be.equal(true);
      })
    }, 2000);

    setTimeout(function() {
      MemoryStorage.get(key01).then(function(data) {
        expect(data).to.be.equal(null);
      })
    }, 4000);
  });
});
