app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {
     
    $scope.ipbusCounters = [ 
        { name: 'OptoHybrid forward 0', stb: 0, ack: 0 }, 
        { name: 'OptoHybrid forward 1', stb: 0, ack: 0 }, 
        { name: 'Tracking data readout 0', stb: 0, ack: 0 }, 
        { name: 'Tracking data readout 1', stb: 0, ack: 0 }, 
        { name: 'Counters', stb: 0, ack: 0 }
    ];    

    $scope.t1Counters = [
        { name: 'AMC13 LV1A', cnt: 0 },
        { name: 'AMC13 Calpulse', cnt: 0 },
        { name: 'AMC13 Resync', cnt: 0 },
        { name: 'AMC13 BC0', cnt: 0 }
    ];

    $scope.gtxCounters = [
        { name: 'Tracking data link 0', cnt: 0 },
        { name: 'Tracking data link 1', cnt: 0 },
        { name: 'Trigger data link 0', cnt: 0 },
        { name: 'Trigger data link 1', cnt: 0 } 
    ];

    function get_glib_counters() {
        // IPBus strobes
        socket.ipbus_read(glib_counter_reg(0), function(data) { $scope.ipbusCounters[0].stb = data; }); 
        socket.ipbus_read(glib_counter_reg(1), function(data) { $scope.ipbusCounters[1].stb = data; }); 
        socket.ipbus_read(glib_counter_reg(2), function(data) { $scope.ipbusCounters[2].stb = data; }); 
        socket.ipbus_read(glib_counter_reg(3), function(data) { $scope.ipbusCounters[3].stb = data; }); 
        socket.ipbus_read(glib_counter_reg(4), function(data) { $scope.ipbusCounters[4].stb = data; });
        // IPBus acknowledgments
        socket.ipbus_read(glib_counter_reg(5), function(data) { $scope.ipbusCounters[0].ack = data; }); 
        socket.ipbus_read(glib_counter_reg(6), function(data) { $scope.ipbusCounters[1].ack = data; }); 
        socket.ipbus_read(glib_counter_reg(7), function(data) { $scope.ipbusCounters[2].ack = data; }); 
        socket.ipbus_read(glib_counter_reg(8), function(data) { $scope.ipbusCounters[3].ack = data; }); 
        socket.ipbus_read(glib_counter_reg(9), function(data) { $scope.ipbusCounters[4].ack = data; }); 
        // T1
        socket.ipbus_read(glib_counter_reg(10), function(data) { $scope.t1Counters[0].cnt = data; }); 
        socket.ipbus_read(glib_counter_reg(11), function(data) { $scope.t1Counters[1].cnt = data; }); 
        socket.ipbus_read(glib_counter_reg(12), function(data) { $scope.t1Counters[2].cnt = data; }); 
        socket.ipbus_read(glib_counter_reg(13), function(data) { $scope.t1Counters[3].cnt = data; }); 
        // GTX
        socket.ipbus_read(glib_counter_reg(14), function(data) { $scope.gtxCounters[0].cnt = data; }); 
        socket.ipbus_read(glib_counter_reg(15), function(data) { $scope.gtxCounters[1].cnt = data; }); 
        socket.ipbus_read(glib_counter_reg(16), function(data) { $scope.gtxCounters[2].cnt = data; }); 
        socket.ipbus_read(glib_counter_reg(17), function(data) { $scope.gtxCounters[3].cnt = data; }); 
    }

    function get_status_loop() {
        get_glib_counters();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.reset_ipbus_counters = function() {       
        for (var i = 0; i <= 9; ++i) socket.ipbus_write(glib_counter_reg(i), 0);
        get_glib_counters();
    };

    $scope.reset_t1_counters = function() {       
        for (var i = 10; i <= 13; ++i) socket.ipbus_write(glib_counter_reg(i), 0);
        get_glib_counters();
    };

    $scope.reset_gtx_counters = function() {       
        for (var i = 14; i <= 17; ++i) socket.ipbus_write(glib_counter_reg(i), 0);
        get_glib_counters();
    };

}]);