Web Application Messaging Protocol Implementation
=================================================

[![NPM version](https://img.shields.io/npm/v/wampi.svg?style=flat-square)](https://www.npmjs.com/package/wampi)
[![Dependencies Status](https://img.shields.io/david/DarkPark/wampi.svg?style=flat-square)](https://david-dm.org/DarkPark/wampi)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-blue.svg?style=flat-square)](https://gitter.im/DarkPark/stb)


[WAMP](http://wamp-proto.org/) lightweight implementation for both browser and server-side.

`wampi` extends [Emitter](https://github.com/stbsdk/emitter) interface.
It does not create any WebSocket connections but uses existing one.


## Installation ##

```bash
npm install wampi
```


## Usage ##

Add the constructor to the scope:

```js
var Wampi = require('wampi');
```

Create an instance from some existing WebSocket connection:

```js
var ws    = new WebSocket('ws://echo.websocket.org'),
    wampi = new Wampi(ws);
```

Send message to execute remotely:

```js
wampi.call('getInfo', {id: 128}, function ( error, result ) {
	// handle execution result
});
```

Serve remote request:

```js
wampi.addListener('setTime', function ( params, callback ) {
	// handle request ...
	// send back results to the sender
	callback(null, requestedData);
});
```

Send notification with some optional data:

```js
wampi.call('onUserUpdate', newUserData);
```

Serve received notification:

```js
wampi.addListener('onUserUpdate', function ( event ) {
	// handle notification data ...
});
```

To catch the moment when WebSocket connection is ready use:

```js
wampi.socket.onopen = function() {
	// send or receive messages here
};
```


## Contribution ##

If you have any problem or suggestion please open an issue [here](https://github.com/DarkPark/wampi/issues).
Pull requests are welcomed with respect to the [JavaScript Code Style](https://github.com/DarkPark/jscs).


## License ##

`wampi` is released under the [GPL-3.0 License](http://opensource.org/licenses/GPL-3.0).
