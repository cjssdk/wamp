/**
 * Mocha tests entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
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


global.DEBUG = true;


// ready
server.on('listening', function listening () {
    // extend Object.prototype
    require('should');

    // add specs
    mocha.addFile('./tests/specs');

    // exec
    mocha.run(function ( failures ) {
        // return exit code
        process.exit(failures);
    });
});


// serve requests
server.on('connection', function connection ( connection ) {
    // wrap
    connection = new Wamp(connection);

    // API methods and events
    connection.addListeners({
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
    });
});
