localstorage-ttl
================

Promise-based API for Browser localStorage and Node contexts.

Installation
------------

npm install localstorage-ttl --save

The Browser's localStorage
--------------------------

The subtle quirks of HTML5's localStorage are replaced with a simple API that
is intuitive to use and just gets the job done.

You may be wondering: Isn't localStorage's native interface already simple to
use? Why do I need to use <code>localstorage-ttl</code> at all? You certainly
can use the native API, but if you do, you'll quickly discover that:

1. The native localStorage can only store strings.

2. There is no optional timeout.

This module takes care of these limitations lickety-split.

Node.js Context on the Server
-----------------------------

Sometimes we want an ultra simple way to store and retrieve objects on the back
end in Node, without having to set up yet another server.
<code>localstorage-ttl</code> can be used in a pure Node environment, without a
browser. Examples below demonstrate how this is done.

Usage and Examples
------------------

__Use LocalStorage for Browser, MemoryStorage for Node__

Whereas the browser can use either the LocalStorage or the MemoryStorage module,
Node contexts can only use the MemoryStorage module.

The following examples use the LocalStorage module, but MemoryStorage can use
the same methods.

```javascript
import { LocalStorage } from 'localstorage-ttl';

OR

import { MemoryStorage } from 'localstorage-ttl';

// store
const data = {a: 1, b: true, stuff: {n: [2, 3, 5], composer: 'Stravinsky'}};
LocalStorage.put('myKey', data).then(() => {
  // data is in browser's localStorage
});

// retrieve
LocalStorage.get('myKey').then((data) => {
  // do what you need with data
});
```

__More About Retrieving Stored Data__

Inspired by Python's get() method, an optional 2nd arg is available.

```javascript
import { LocalStorage } from 'localstorage-ttl';

// Retrieve a key which does not exist:
LocalStorage.get('badKey').then((data) => {
  // data => null
})

// Retrieve a key which does not exist using an optional 2nd arg
LocalStorage.get('badKey', {a: 1, b: 2}).then((data) => {
  // data => {"a": 1, "b": 2}
});
```

__Setting A Timeout__

Browser's localStorage data remains available until it is manually deleted by
the user.

However, sometimes we want our storage cache to expire after a specific duration
of time has elapsed, regardless of a user's manual interaction.

<code>localstorage-ttl</code> allows a timeout value in seconds to be set. This
timeout mechanism works for both LocalStorage and MemoryStorage usage.

```javascript
import { LocalStorage } from 'localstorage-ttl';

// After a key/value is LocalStorage.put('myKey', data), the data cannot be
// retrieved after 5 minutes has elapsed.
LocalStorage.timeoutInSeconds = 300;
```

The timeout behavior is disabled by default (timeoutInSeconds is set to null).

__Utilities__

`keyExists(key)` behaves thusly:

If no timeout is set (the default), then the method resolves to true if key
exists, false otherwise.

However, if a timeout has been set, then `keyExists()` method behaves slightly
differently. If no key found, resolves to false. If key exists and the timeout
has not yet expired, resolves to true; if key exists and timeout indicates this
key has expired, then the key is removed and then resolves to false.

```javascript
LocalStorage.keyExists(key).then((result) = {
  // result => boolean
});
```

`removeKey(key)`, as its name suggests, merely removes the key if it exists. If the
key does not exist, it's a no-op.

```javascript
LocalStorage.removeKey(key).then(() => {
  // key has been removed
});
```

`clear()` removes all keys and data.

`keys()` returns a list of keys.

```javascript
LocalStorage.keys().then((keys) => {
  // keys => list of keys
});
```

`isLocalStorageAvailable()` detects if localStorage is available.

This can happen, for example, if iPhone's Safari browser is in private mode, in
which case you can either alert the user to turn off private mode or just
use MemoryStorage instead of LocalStorage.

```javascript
LocalStorage.isLocalStorageAvailable().then((isAvailable) => {
  // isAvailable => boolen
});
```

Credits
-------

Gerry Gold<br/>
November 2017

Have fun!
