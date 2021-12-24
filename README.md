ttl-localstorage
================

API for Browser localStorage and Node contexts.

Installation
------------

npm i ttl-localstorage

Browser localStorage
---------------------

The subtle quirks of HTML5's localStorage are replaced with a simple API that
is intuitive to use and just gets the job done.

You may be wondering: Isn't localStorage's native interface already simple to
use? Why do I need to use <code>ttl-localstorage</code> at all? You certainly
can use the native API, but if you do, you'll quickly discover that:

 - native localStorage has no optional timeout

 - native localStorage can only store strings

<code>ttl-localstorage</code> fixes these limitations.

Node.js Context
----------------

Sometimes we want an ultra simple way to store and retrieve objects on the back
end in Node, without having to set up yet another db or key-value store.
<code>ttl-localstorage</code> can be used in a pure Node environment, without a
browser. Examples below demonstrate how this is done.

Usage and Examples
------------------

__Use LocalStorage for Browser, MemoryStorage for Node__

Whereas the browser can use either the LocalStorage or the MemoryStorage module,
Node contexts can only use the MemoryStorage module.

The following examples use the LocalStorage module, but MemoryStorage can use
the same methods.

```javascript
import { LocalStorage } from 'ttl-localstorage';

OR

import { MemoryStorage } from 'ttl-localstorage';

// store
const data = { a: 1, b: true, stuff: { n: [2, 3, 5], composer: 'Stravinsky' } };
LocalStorage.put('myKey', data);

// retrieve
const data = LocalStorage.get('myKey');
```

__More About Retrieving Stored Data__

Inspired by Python's get() method, an optional 2nd arg is available.

```javascript
import { LocalStorage } from 'ttl-localstorage';

// Retrieve a key which does not exist:
const data = LocalStorage.get('badKey');
// data => null

// Retrieve a key which does not exist using an optional 2nd arg
LocalStorage.get('badKey', { a: 1, b: 2 });
// data => { "a": 1, "b": 2 }
```

TTL: Setting Timeouts
=====================

Standard localStorage data remains available until it is manually deleted by
the user. We fixed that so the developer gets back in control.

<code>ttl-localstorage</code> allows a timeout to be set globally for all keys. This
timeout mechanism works for both LocalStorage and MemoryStorage usage.

__Global Timeout for All Keys__

Just set the timeout once before <code>put</code> operations. Granularity has been kept to seconds instead of finer, impractical time units.

```javascript
import { LocalStorage } from 'ttl-localstorage';

LocalStorage.timeoutInSeconds = 300;

LocalStorage.put(myKey, data);

// myKey can't access the stored data after 5 minutes has elapsed.
```

The global timeout is disabled by default (timeoutInSeconds is initialized to null).

__Key Level Timeout__

Set a timeout on a per-key basis. If a global timeout had already been set, the key level timeout takes priority.

```javascript
import { LocalStorage } from 'ttl-localstorage';

// key will expire in 10 minutes (optional third argument)
LocalStorage.put(ephemeralKey, data, 600);

// key will expire in 1 day
LocalStorage.put(dailyKey, data, 86400);

```

__Utilities__

`keyExists(key)` behaves thusly:

If no timeout is set (the default), then the method resolves to true if key
exists, false otherwise.

However, if a timeout has been set, then `keyExists()` method behaves slightly
differently. If no key found, resolves to false. If key exists and the timeout
has not yet expired, resolves to true; if key exists and timeout indicates this
key has expired, then the key is removed and then resolves to false.

```javascript
const result = LocalStorage.keyExists(key);
// result => boolean
```

`removeKey(key)`, as its name suggests, merely removes the key if it exists. If the
key does not exist, it's a no-op.

```javascript
LocalStorage.removeKey(key);
// key has been removed
```

`clear()` removes all keys and data.

`keys()` returns a list of keys.

```javascript
const keyList = LocalStorage.keys();
```

`isLocalStorageAvailable()` detects if localStorage is available.

This can happen, for example, if iPhone's Safari browser is in private mode, in
which case you can either alert the user to turn off private mode or just
use MemoryStorage instead of LocalStorage.

```javascript
const isAvailable = LocalStorage.isLocalStorageAvailable();
isAvailable => boolean
```

__The Cleaner: Optional Garbarge Collection__

<code>ttl-localstorage</code> lazily removes keys if not explicitly removed via
\#removeKey; if a key is accessed either via #get or #keyExists, the key is
automatically removed if a timeout indicates the key has expired.

There is no garbage collector mechanism always running to periodically clean
things up.

However, if you don't want expired keys lying around, just execute
runGarbageCollector() to manually clean up all keys that haven't been lazily
deleted.

```javascript
const removedKeys = LocalStorage.runGarbageCollector();
```

Credits
-------

Gerry Gold

June December 2021

Have fun!
