/**
 * @module wampi
 * @author Stanislav Kalashnik <sk@infomir.eu>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/** @private */
var Emitter   = require('stb-emitter'),
	messageId = 0,
	callbacks = {};


/**
 * Lightweight WAMP implementation based on WebSockets.
 *
 * @see http://wamp-proto.org/
 * @constructor
 */
function Wampi ( socket ) {
	var self = this;

	// parent constructor call
	Emitter.call(this);

	// link to WebSocket connection
	this.socket = socket;

	if ( 'on' in socket ) {
		// server-side
		socket.on('message', function ( message ) {
			self.router(message);
		});
	} else if ( 'onmessage' in socket ) {
		// desktop browser
		socket.onmessage = function ( event ) {
			self.router(event.data);
		};
	}
}


// inheritance
Wampi.prototype = Object.create(Emitter.prototype);
Wampi.prototype.constructor = Wampi;


/**
 * Internal method to handle messages.
 *
 * @param {string} message JSON data
 *
 * @private
 */
Wampi.prototype.router = function ( message ) {
	try {
		message = JSON.parse(message);
	} catch ( e ) {
		this.socket.send(JSON.stringify({
			jsonrpc: '2.0',
			error: {code: -32700, message: 'Parse error'},
			id: null
		}));
		return;
	}

	if ( 'id' in message && !('method' in message) ) {
		// incoming answer for previous request
		if ( message.id in callbacks ) {
			callbacks[message.id](message.error, message.result);
			delete callbacks[message.id];
		} else {
			// no callback registered for this id
		}
	} else if ( !('id' in message) && 'method' in message ) {
		// incoming notification
		if ( this.events[message.method] ) {
			this.emit(message.method, message.params);
		}
	} else if ( 'id' in message && 'method' in message ) {
		// execute incoming method and report to sender
		if ( this.events[message.method] ) {
			this.emit(message.method, message.params, function ( error, result ) {
				this.socket.send(JSON.stringify({
					jsonrpc: '2.0',
					error: error,
					result: result,
					id: message.id
				}));
			});
		} else {
			// wrong method
			this.socket.send(JSON.stringify({
				jsonrpc: '2.0',
				error: {code: -32601, message: 'Method not found'},
				id: message.id
			}));
		}
	} else {
		// wrong request
		this.socket.send(JSON.stringify({
			jsonrpc: '2.0',
			error: {code: -32600, message: 'Invalid Request'},
			id: null
		}));
	}
};


/**
 * Send message to execute remotely or notify.
 *
 * @param {string} method procedure or event name
 * @param {*} params procedure associated data
 * @param {function} callback remote call results handler
 */
Wampi.prototype.call = function ( method, params, callback ) {
	var message = {
		jsonrpc: '2.0',
		method: method
	};

	if ( params ) {
		message.params = params;
	}

	// execution mode with callback
	// notification mode otherwise
	if ( typeof callback === 'function' ) {
		message.id = ++messageId;
		callbacks[messageId] = callback;
	}

	this.socket.send(JSON.stringify(message));
};


// public
module.exports = Wampi;
