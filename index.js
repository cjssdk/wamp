/**
 * @license The MIT License (MIT)
 * @copyright Stanislav Kalashnik <darkpark.main@gmail.com>
 */

'use strict';

/** @private */
var Emitter   = require('cjs-emitter'),
    messageId = 0,
    callbacks = {};


/**
 * Lightweight WAMP implementation based on WebSockets.
 *
 * @param {WebSocket} socket link to socket connection to wrap
 *
 * @see http://wamp-proto.org/
 * @constructor
 */
function Wamp ( socket ) {
    var self = this;

    console.assert(typeof this === 'object', 'must be constructed via new');

    // parent constructor call
    Emitter.call(this);

    this.socket = socket;

    if ( 'on' in socket ) {
        // server-side
        socket.on('message', function ( message ) {
            self.route(message);
        });
    } else if ( 'onmessage' in socket ) {
        // desktop browser
        socket.onmessage = function ( event ) {
            self.route(event.data);
        };
    }
}


// inheritance
Wamp.prototype = Object.create(Emitter.prototype);
Wamp.prototype.constructor = Wamp;


/**
 * Send data through the given socket.
 * Should be overridden in the
 *
 * @param {Object} message data to send
 *
 * @abstract
 */
Wamp.prototype.send = function ( message ) {
    throw new Error('must be implemented!');

    // connection is open
    if ( this.socket.readyState === 1 ) {
        // protocol version
        message.jsonrpc = '2.0';

        this.socket.send(JSON.stringify(message));
    }
};


/**
 * Internal method to handle messages.
 *
 * @param {string} message request JSON data
 *
 * @private
 */
Wamp.prototype.route = function ( message ) {
    var self = this,
        data;

    try {
        data = JSON.parse(message);
    } catch ( error ) {
        this.send({
            error: {code: -32700, message: 'Parse error'},
            id: null
        });

        return;
    }

    if ( 'id' in data && !('method' in data) ) {
        // incoming answer for previous request
        if ( data.id in callbacks ) {
            callbacks[data.id](data.error, data.result);
            delete callbacks[data.id];
        } else {
            // no callback registered for this id
        }
    } else if ( !('id' in data) && 'method' in data ) {
        // incoming notification
        if ( this.events[data.method] ) {
            this.emit(data.method, data.params);
        }
    } else if ( 'id' in data && 'method' in data ) {
        // execute incoming method and report to sender
        if ( this.events[data.method] ) {
            this.emit(data.method, data.params, function ( error, result ) {
                self.send({
                    error: error,
                    result: result,
                    id: data.id
                });
            });
        } else {
            // wrong method
            this.send({
                error: {code: -32601, message: 'Method not found'},
                id: data.id
            });
        }
    } else {
        // wrong request
        this.send({
            error: {code: -32600, message: 'Invalid Request'},
            id: null
        });
    }
};


/**
 * Send message to execute remotely or notify (without `callback` argument).
 *
 * @param {string} method procedure or event name
 * @param {*} [params] procedure associated data
 * @param {function} [callback] remote call results handler
 */
Wamp.prototype.call = function ( method, params, callback ) {
    var message = {
        method: method,
        params: params
    };

    // execution mode with callback
    // notification mode otherwise
    if ( typeof callback === 'function' ) {
        message.id = ++messageId;
        callbacks[messageId] = callback;
    }

    this.send(message);
};


// public
module.exports = Wamp;
