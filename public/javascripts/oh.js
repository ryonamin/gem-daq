app.controller('ohCtrl', ['$scope', 'socket', function($scope, socket) {
  
    $scope.t1SourceList = [
        { name: "AMC13", id: 0},
        { name: "OptoHybrid", id: 1},
        { name: "External", id: 2},
        { name: "All", id: 3}
    ];

    $scope.t1Source = 0;

    $scope.clockSourceList = [
        { name: "On board oscillator", id: 0},
        { name: "GTX recovered clock", id: 1},
        { name: "External clock", id: 2}
    ];

    $scope.clockSource = 0;

    $scope.sbitSelect = 0;

    $scope.vfat2sMask = "000000";

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
        { name: 'AMC13 LV1A', cnt: 0 },
        { name: 'AMC13 Calpulse', cnt: 0 },
        { name: 'AMC13 Resync', cnt: 0 },
        { name: 'AMC13 BC0', cnt: 0 },
        { name: 'OptoHybrid LV1A', cnt: 0 },
        { name: 'OptoHybrid Calpulse', cnt: 0 },
        { name: 'OptoHybrid Resync', cnt: 0 },
        { name: 'OptoHybrid BC0', cnt: 0 },
        { name: 'External LV1A', cnt: 0 },
        { name: 'External Calpulse', cnt: 0 },
        { name: 'External Resync', cnt: 0 },
        { name: 'External BC0', cnt: 0 },
        { name: 'Sent LV1A', cnt: 0 },
        { name: 'Sent Calpulse', cnt: 0 },
        { name: 'Sent Resync', cnt: 0 },
        { name: 'Sent BC0', cnt: 0 } 
    ];

    $scope.gtxCounters = [
        { name: 'Tracking data link errors', cnt: 0 },
        { name: 'Trigger data link errors', cnt: 0 } 
    ];

    $scope.set_system_regs = function() {        
        var mask = parseInt($scope.vfat2sMask, 16);
        socket.ipbus_write(system_reg(0), mask);
        socket.ipbus_write(system_reg(1), ($scope.t1Source.id));
        socket.ipbus_write(system_reg(3), ($scope.clockSource.id));
        socket.ipbus_write(system_reg(4), ($scope.sbitSelect));
        get_oh_system_regs();
    };

    function get_oh_system_regs() {
        socket.ipbus_read(system_reg(0), function(data) { 
            var mask = data.toString(16).toUpperCase(); 
            if (mask.length == 6) $scope.vfat2sMask = mask;
            else $scope.vfat2sMask = Array(6 - mask.length + 1).join('0') + mask;
        }); 
        socket.ipbus_read(system_reg(1), function(data) { $scope.t1Source = $scope.t1SourceList[data]; }); 
        socket.ipbus_read(system_reg(3), function(data) { $scope.clockSource = $scope.clockSourceList[data]; }); 
        socket.ipbus_read(system_reg(4), function(data) { $scope.sbitSelect = data; }); 
    }

    get_oh_system_regs();

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
        socket.ipbus_read(counter_reg(88), function(data) { $scope.t1Counters[4].cnt = data; }); 
        socket.ipbus_read(counter_reg(89), function(data) { $scope.t1Counters[5].cnt = data; }); 
        socket.ipbus_read(counter_reg(90), function(data) { $scope.t1Counters[6].cnt = data; }); 
        socket.ipbus_read(counter_reg(91), function(data) { $scope.t1Counters[7].cnt = data; }); 
        socket.ipbus_read(counter_reg(92), function(data) { $scope.t1Counters[8].cnt = data; }); 
        socket.ipbus_read(counter_reg(93), function(data) { $scope.t1Counters[9].cnt = data; }); 
        socket.ipbus_read(counter_reg(94), function(data) { $scope.t1Counters[10].cnt = data; }); 
        socket.ipbus_read(counter_reg(95), function(data) { $scope.t1Counters[11].cnt = data; }); 
        socket.ipbus_read(counter_reg(96), function(data) { $scope.t1Counters[12].cnt = data; }); 
        socket.ipbus_read(counter_reg(97), function(data) { $scope.t1Counters[13].cnt = data; }); 
        socket.ipbus_read(counter_reg(98), function(data) { $scope.t1Counters[14].cnt = data; }); 
        socket.ipbus_read(counter_reg(99), function(data) { $scope.t1Counters[15].cnt = data; }); 
        // GTX
        socket.ipbus_read(counter_reg(100), function(data) { $scope.gtxCounters[0].cnt = data; }); 
        socket.ipbus_read(counter_reg(101), function(data) { $scope.gtxCounters[1].cnt = data; }); 
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
        for (var i = 84; i <= 99; ++i) socket.ipbus_write(counter_reg(i), 0);
        get_oh_counters();
    };

    $scope.reset_gtx_counters = function() {       
        for (var i = 100; i <= 101; ++i) socket.ipbus_write(counter_reg(i), 0);
        get_oh_counters();
    };


}]);