// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', { 'packages': ['corechart'] });

var app = angular.module('app', []);

app.factory('socket', function ($rootScope) {
    
    var socket = io.connect('http://localhost:3000');

    return {

        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },

        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) callback.apply(socket, args);
                });
            })
        },

        ipbus_read: function(addr, clientCallback) {
            socket.emit('ipbus_read', { addr: addr }, function(response) {
                $rootScope.$apply(function() {
                    if (clientCallback) {
                        if (response.infoCode == 0x0) clientCallback(response.data);
                        else clientCallback(null);
                    }
                });
            });
        },

        ipbus_write: function(addr, data, clientCallback) {
            socket.emit('ipbus_write', { addr: addr, data: data }, function(response) {
                $rootScope.$apply(function() {
                    if (clientCallback) {
                        if (response.infoCode == 0x0) clientCallback(true);
                        else clientCallback(false);
                    }
                });
            });
        }

    };
});

app.filter('hex', function() {
    return function(n) {
        n = parseInt(n);
        if (n < 0) n += 0xFFFFFFFF + 1;
        return '0x' + n.toString(16).toUpperCase();
    };
});