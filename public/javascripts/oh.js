app.controller('ohCtrl', ['$scope', 'socket', function($scope, socket) {
  
    $scope.wbCounters = [ 
        { name: 'GTX master', stb: 0, ack: 0 }, 
        { name: 'Extended I2C master', stb: 0, ack: 0 }, 
        { name: 'Scan module master', stb: 0, ack: 0 }, 
        { name: 'DAC module master', stb: 0, ack: 0 }, 
        { name: 'I2C 0 slave', stb: 0, ack: 0 }, 
        { name: 'I2C 1 slave', stb: 0, ack: 0 }, 
        { name: 'I2C 2 slave', stb: 0, ack: 0 }, 
        { name: 'I2C 3 slave', stb: 0, ack: 0 }, 
        { name: 'I2C 4 slave', stb: 0, ack: 0 }, 
        { name: 'I2C 5 slave', stb: 0, ack: 0 }, 
        { name: 'Extended I2C slave', stb: 0, ack: 0 }, 
        { name: 'Scan module slave', stb: 0, ack: 0 }, 
        { name: 'T1 controller slave', stb: 0, ack: 0 }, 
        { name: 'DAC scan slave', stb: 0, ack: 0 },
        { name: 'ADC module slave', stb: 0, ack: 0 },
        { name: 'Clocking module slave', stb: 0, ack: 0 },
        { name: 'Counter module slave', stb: 0, ack: 0 }, 
        { name: 'System module slave', stb: 0, ack: 0 }
    ];    

    $scope.t1Counters = [
        { name: 'LV1A', cnt: 0 },
        { name: 'Calpulse', cnt: 0 },
        { name: 'Resync', cnt: 0 },
        { name: 'BC0', cnt: 0 } 
    ];

    $scope.gtxCounters = [
        { name: 'Tracking data link errors', cnt: 0 },
        { name: 'Trigger data link errors', cnt: 0 } 
    ];

    function get_oh_counters() {
        // Master strobes
        socket.ipbus_read(counter_reg(0), function(data) { $scope.wbCounters[0].stb = data; }); 
        socket.ipbus_read(counter_reg(1), function(data) { $scope.wbCounters[1].stb = data; }); 
        socket.ipbus_read(counter_reg(2), function(data) { $scope.wbCounters[2].stb = data; }); 
        socket.ipbus_read(counter_reg(3), function(data) { $scope.wbCounters[3].stb = data; }); 
        // Master acknowledgments
        socket.ipbus_read(counter_reg(4), function(data) { $scope.wbCounters[0].ack = data; }); 
        socket.ipbus_read(counter_reg(5), function(data) { $scope.wbCounters[1].ack = data; }); 
        socket.ipbus_read(counter_reg(6), function(data) { $scope.wbCounters[2].ack = data; }); 
        socket.ipbus_read(counter_reg(7), function(data) { $scope.wbCounters[3].ack = data; }); 
        // Slave strobes        
        socket.ipbus_read(counter_reg(8), function(data) { $scope.wbCounters[4].stb = data; }); 
        socket.ipbus_read(counter_reg(9), function(data) { $scope.wbCounters[5].stb = data; }); 
        socket.ipbus_read(counter_reg(10), function(data) { $scope.wbCounters[6].stb = data; }); 
        socket.ipbus_read(counter_reg(11), function(data) { $scope.wbCounters[7].stb = data; }); 
        socket.ipbus_read(counter_reg(12), function(data) { $scope.wbCounters[8].stb = data; }); 
        socket.ipbus_read(counter_reg(13), function(data) { $scope.wbCounters[9].stb = data; }); 
        socket.ipbus_read(counter_reg(14), function(data) { $scope.wbCounters[10].stb = data; }); 
        socket.ipbus_read(counter_reg(15), function(data) { $scope.wbCounters[11].stb = data; }); 
        socket.ipbus_read(counter_reg(16), function(data) { $scope.wbCounters[12].stb = data; }); 
        socket.ipbus_read(counter_reg(17), function(data) { $scope.wbCounters[13].stb = data; }); 
        socket.ipbus_read(counter_reg(18), function(data) { $scope.wbCounters[14].stb = data; }); 
        socket.ipbus_read(counter_reg(19), function(data) { $scope.wbCounters[15].stb = data; }); 
        socket.ipbus_read(counter_reg(20), function(data) { $scope.wbCounters[16].stb = data; }); 
        socket.ipbus_read(counter_reg(21), function(data) { $scope.wbCounters[17].stb = data; }); 
        // Slave acknowledgments        
        socket.ipbus_read(counter_reg(22), function(data) { $scope.wbCounters[4].ack = data; }); 
        socket.ipbus_read(counter_reg(23), function(data) { $scope.wbCounters[5].ack = data; }); 
        socket.ipbus_read(counter_reg(24), function(data) { $scope.wbCounters[6].ack = data; }); 
        socket.ipbus_read(counter_reg(25), function(data) { $scope.wbCounters[7].ack = data; }); 
        socket.ipbus_read(counter_reg(26), function(data) { $scope.wbCounters[8].ack = data; }); 
        socket.ipbus_read(counter_reg(27), function(data) { $scope.wbCounters[9].ack = data; }); 
        socket.ipbus_read(counter_reg(28), function(data) { $scope.wbCounters[10].ack = data; }); 
        socket.ipbus_read(counter_reg(29), function(data) { $scope.wbCounters[11].ack = data; }); 
        socket.ipbus_read(counter_reg(30), function(data) { $scope.wbCounters[12].ack = data; }); 
        socket.ipbus_read(counter_reg(31), function(data) { $scope.wbCounters[13].ack = data; }); 
        socket.ipbus_read(counter_reg(32), function(data) { $scope.wbCounters[14].ack = data; }); 
        socket.ipbus_read(counter_reg(33), function(data) { $scope.wbCounters[15].ack = data; }); 
        socket.ipbus_read(counter_reg(34), function(data) { $scope.wbCounters[16].ack = data; }); 
        socket.ipbus_read(counter_reg(35), function(data) { $scope.wbCounters[17].ack = data; }); 
        // T1
        socket.ipbus_read(counter_reg(84), function(data) { $scope.t1Counters[0].cnt = data; }); 
        socket.ipbus_read(counter_reg(85), function(data) { $scope.t1Counters[1].cnt = data; }); 
        socket.ipbus_read(counter_reg(86), function(data) { $scope.t1Counters[2].cnt = data; }); 
        socket.ipbus_read(counter_reg(87), function(data) { $scope.t1Counters[3].cnt = data; }); 
        // GTX
        socket.ipbus_read(counter_reg(88), function(data) { $scope.gtxCounters[0].cnt = data; }); 
        socket.ipbus_read(counter_reg(89), function(data) { $scope.gtxCounters[1].cnt = data; }); 
    }

    function get_status_loop() {
        get_oh_counters();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.reset_wb_counters = function() {       
        for (var i = 0; i <= 35; ++i) socket.ipbus_write(counter_reg(i), 0);
        get_oh_counters();
    };

    $scope.reset_t1_counters = function() {       
        for (var i = 84; i <= 87; ++i) socket.ipbus_write(counter_reg(i), 0);
        get_oh_counters();
    };

    $scope.reset_gtx_counters = function() {       
        for (var i = 88; i <= 89; ++i) socket.ipbus_write(counter_reg(i), 0);
        get_oh_counters();
    };


}]);