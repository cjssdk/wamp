/**
 * Mocha tests.
 *
 * @license The MIT License (MIT)
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 */

'use strict';

/* eslint-env mocha */
/* eslint-disable no-useless-call */


var should    = require('should'),
    Wamp      = require('../index'),
    WebSocket = require('ws'),
    wamp, lastMessage;


describe('General tests', function () {

    before(function ( done ) {
        var socket = new WebSocket('ws://localhost:7070/');

        socket.on('message', function ( message ) {
            lastMessage = JSON.parse(message);
        });

        wamp = new Wamp(socket);
        wamp.socket.on('open', done);

        wamp.addListener('sum', function ( params, callback ) {
            callback(null, params.x + params.y);
        });
    });

    after(function () {
        wamp.socket.close();
    });

    it('should fail: call null method with null params', function ( done ) {
        wamp.call(null, null, function ( error, result ) {
            should.exist(error);
            error.should.containDeep({code: -32601, message: 'Method not found'});

            lastMessage.should.containDeep({error: {code: -32601, message: 'Method not found'}, id: 1, jsonrpc: '2.0'});

            should.not.exist(result);

            done();
        });
    });

    it('should fail: call empty method with null params', function ( done ) {
        wamp.call('', null, function ( error, result ) {
            should.exist(error);
            error.should.containDeep({code: -32601, message: 'Method not found'});

            lastMessage.should.containDeep({error: {code: -32601, message: 'Method not found'}, id: 2, jsonrpc: '2.0'});

            should.not.exist(result);

            done();
        });
    });

    it('should fail: call non-existing method with null params', function ( done ) {
        wamp.call('qwe', null, function ( error, result ) {
            should.exist(error);
            error.should.containDeep({code: -32601, message: 'Method not found'});

            lastMessage.should.containDeep({error: {code: -32601, message: 'Method not found'}, id: 3, jsonrpc: '2.0'});

            should.not.exist(result);

            done();
        });
    });

    it('should fail: call getError method', function ( done ) {
        wamp.call('getError', null, function ( error, result ) {
            should.exist(error);
            error.should.containDeep({message: 'oops'});

            lastMessage.should.containDeep({error: {message: 'oops'}, id: 4, jsonrpc: '2.0'});

            should.not.exist(result);

            done();
        });
    });

    it('should pass: call getTrue method', function ( done ) {
        wamp.call('getTrue', null, function ( error, result ) {
            should.not.exist(error);

            lastMessage.should.containDeep({error: null, result: true, id: 5, jsonrpc: '2.0'});

            should.exist(result);
            result.should.equal(true);

            done();
        });
    });

    it('should pass: call getFalse method', function ( done ) {
        wamp.call('getFalse', null, function ( error, result ) {
            should.not.exist(error);

            lastMessage.should.containDeep({error: null, result: false, id: 6, jsonrpc: '2.0'});

            should.exist(result);
            result.should.equal(false);

            done();
        });
    });

    it('should pass: call getNumber method', function ( done ) {
        wamp.call('getNumber', null, function ( error, result ) {
            should.not.exist(error);

            lastMessage.should.containDeep({error: null, result: 128, id: 7, jsonrpc: '2.0'});

            should.exist(result);
            result.should.equal(128);

            done();
        });
    });

    it('should pass: call getString method', function ( done ) {
        wamp.call('getString', null, function ( error, result ) {
            should.not.exist(error);

            lastMessage.should.containDeep({error: null, result: 'cjs-wamp', id: 8, jsonrpc: '2.0'});

            should.exist(result);
            result.should.equal('cjs-wamp');

            done();
        });
    });

    it('should pass: call echo method', function ( done ) {
        wamp.call('echo', {id: 256}, function ( error, result ) {
            should.not.exist(error);

            lastMessage.should.containDeep({error: null, result: {id: 256}, id: 9, jsonrpc: '2.0'});

            should.exist(result);
            result.should.containDeep({id: 256});

            done();
        });
    });

    it('should pass: call rpc method', function ( done ) {
        wamp.call('rpc', {x: 6, y: 8}, function ( error, result ) {
            should.not.exist(error);

            lastMessage.should.containDeep({error: null, result: 14, id: 10, jsonrpc: '2.0'});

            should.exist(result);
            result.should.equal(14);

            done();
        });
    });

});
