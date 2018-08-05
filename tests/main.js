/**
 * Mocha tests entry point.
 *
 * @license The MIT License (MIT)
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 */

'use strict';

var Mocha  = require('mocha'),
    mocha  = new Mocha({
        reporter: 'spec',
        timeout: 1000,
        bail: true,
        fullTrace: true
    }),
    server = new (require('ws').Server)({port: 9090}),
    Wamp   = require('../index');


global.DEVELOP = true;


// ready
server.on('listening', function listening () {
    // extend Object.prototype
    require('should');

    // add specs
    mocha.addFile('./tests/specs');

    // exec
    mocha.run(function ( failures ) {
        if ( failures ) {
            process.exitCode = 1;
        }

        // stop websocket server
        server.close();
    });
});


// serve requests
server.on('connection', function connection ( connection ) {
    var methods = {
        getTrue: function ( params, callback ) {
            callback(null, true);
        },

        getFalse: function ( params, callback ) {
            callback(null, false);
        },

        getNumber: function ( params, callback ) {
            callback(null, 128);
        },

        getString: function ( params, callback ) {
            callback(null, 'cjs-wamp');
        },

        getError: function ( params, callback ) {
            callback({message: 'oops'});
        },

        echo: function ( params, callback ) {
            callback(null, params);
        },

        rpc: function ( params, callback ) {
            connection.call('sum', params, function ( error, result ) {
                callback(error, result);
            });
        }
    };

    // wrap
    connection = new Wamp(connection);

    // apply all listeners
    Object.keys(methods).forEach(function ( name ) {
        connection.addListener(name, methods[name]);
    });
});
