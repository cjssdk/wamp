WAMP Implementation
===================

[![build status](https://img.shields.io/travis/cjssdk/wamp.svg?style=flat-square)](https://travis-ci.org/cjssdk/wamp)
[![npm version](https://img.shields.io/npm/v/cjs-wamp.svg?style=flat-square)](https://www.npmjs.com/package/cjs-wamp)
[![dependencies status](https://img.shields.io/david/cjssdk/wamp.svg?style=flat-square)](https://david-dm.org/cjssdk/wamp)
[![devDependencies status](https://img.shields.io/david/dev/cjssdk/wamp.svg?style=flat-square)](https://david-dm.org/cjssdk/wamp?type=dev)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-blue.svg?style=flat-square)](https://gitter.im/DarkPark/cjssdk)
[![RunKit](https://img.shields.io/badge/RunKit-try-yellow.svg?style=flat-square)](https://npm.runkit.com/cjs-wamp)


[WAMP](http://wamp-proto.org/) lightweight implementation for both browser and server-side (with [ws](https://www.npmjs.com/package/ws) npm package).

`cjs-wamp` extends [Emitter](https://github.com/cjssdk/emitter) interface.
It does not create any WebSocket connections but uses an existing one.


## Installation ##

```bash
npm install cjs-wamp
```


## Usage ##

Add the constructor to the scope:

```js
var Wamp = require('cjs-wamp');
```

Create an instance from some existing WebSocket connection:

```js
var ws   = new WebSocket('ws://echo.websocket.org'),
    wamp = new Wamp(ws);
```

Send message to execute remotely:

```js
wamp.call('getInfo', {id: 128}, function ( error, result ) {
    // handle execution result
});
```

Serve remote request:

```js
wamp.addListener('getData', function ( params, callback ) {
    // handle request ...
    // send back results to the sender
    callback(null, requestedData);
});
```

Send notification with some optional data:

```js
wamp.call('onUserUpdate', newUserData);
```

Serve received notification:

```js
wamp.addListener('onUserUpdate', function ( event ) {
    // handle notification data ...
});
```

Original WebSocket connection is also available:

```js
wamp.socket.send('some message');
```

Catch the moment when WebSocket connection is ready:

```js
wamp.socket.onopen = function() {
    // send or receive messages here
};
```

Server-side example with [ws](https://www.npmjs.com/package/ws) npm package:

```js
var server = new (require('ws').Server)({port: 9000}),
    Wamp   = require('cjs-wamp');

server.on('connection', function ( connection ) {
    var wamp = new Wamp(connection);

    wamp.call('getInfo', {id: 128}, function ( error, result ) {
        // handle execution result
    });
});
```

#### Error codes

 Value  | Message          | Description
--------|------------------|-------------
 -32700 | Parse error      | Invalid JSON data was received.
 -32600 | Invalid Request  | The JSON sent is not a valid Request object.
 -32601 | Method not found | The method does not exist / is not available.


## Contribution ##

If you have any problems or suggestions please open an [issue](https://github.com/cjssdk/wamp/issues)
according to the contribution [rules](.github/contributing.md).


## License ##

`cjs-wamp` is released under the [MIT License](license.md).
