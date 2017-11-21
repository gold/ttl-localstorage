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

describe('ttl-localstorage', function() {

  beforeEach(async function() {
    await MemoryStorage.put(KEY_1, DATA_1);
    await MemoryStorage.put(KEY_2, DATA_2);
  });

  describe('#get', function() {
    it('gets object from storage', async function() {
      const storedData = await MemoryStorage.get(KEY_1);
      expect(storedData.times[1]).to.equal('then');
    })
    it('gets string from storage', async function() {
      const storedString = await MemoryStorage.get(KEY_2);
      expect(storedString).to.equal('just a string');
    })
  });

  describe('#keys', function() {
    it('returns a list of keys used in all put operations', async function() {
      const keyList = await MemoryStorage.keys();
      expect(keyList[1]).to.be.equal('第2のキー');
    })
  });

  describe('#removeKey and #keyExists', function() {
    it('removes a key and its associated data', async function() {
      let keyList = await MemoryStorage.keys();
      expect(keyList.length).to.be.equal(2);

      let keyExistsResult = await MemoryStorage.keyExists(KEY_1)
      expect(keyExistsResult).to.equal(true);

      MemoryStorage.removeKey(KEY_1);
      keyList = await MemoryStorage.keys();
      expect(keyList.length).to.be.equal(1);

      keyExistsResult = await MemoryStorage.keyExists(KEY_1)
      expect(keyExistsResult).to.equal(false);
    })
  });

});
