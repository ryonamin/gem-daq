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

    function get_oh_counters() {
        // Master strobes
        socket.ipbus_read(counter_reg(48), function(data) { $scope.wbCounters[0].stb = data; }); 
        socket.ipbus_read(counter_reg(49), function(data) { $scope.wbCounters[1].stb = data; }); 
        socket.ipbus_read(counter_reg(50), function(data) { $scope.wbCounters[2].stb = data; }); 
        socket.ipbus_read(counter_reg(51), function(data) { $scope.wbCounters[3].stb = data; }); 
        // Master acknowledgments
        socket.ipbus_read(counter_reg(52), function(data) { $scope.wbCounters[0].ack = data; }); 
        socket.ipbus_read(counter_reg(53), function(data) { $scope.wbCounters[1].ack = data; }); 
        socket.ipbus_read(counter_reg(54), function(data) { $scope.wbCounters[2].ack = data; }); 
        socket.ipbus_read(counter_reg(55), function(data) { $scope.wbCounters[3].ack = data; }); 
        // Slave strobes        
        socket.ipbus_read(counter_reg(56), function(data) { $scope.wbCounters[4].stb = data; }); 
        socket.ipbus_read(counter_reg(57), function(data) { $scope.wbCounters[5].stb = data; }); 
        socket.ipbus_read(counter_reg(58), function(data) { $scope.wbCounters[6].stb = data; }); 
        socket.ipbus_read(counter_reg(59), function(data) { $scope.wbCounters[7].stb = data; }); 
        socket.ipbus_read(counter_reg(60), function(data) { $scope.wbCounters[8].stb = data; }); 
        socket.ipbus_read(counter_reg(61), function(data) { $scope.wbCounters[9].stb = data; }); 
        socket.ipbus_read(counter_reg(62), function(data) { $scope.wbCounters[10].stb = data; }); 
        socket.ipbus_read(counter_reg(63), function(data) { $scope.wbCounters[11].stb = data; }); 
        socket.ipbus_read(counter_reg(64), function(data) { $scope.wbCounters[12].stb = data; }); 
        socket.ipbus_read(counter_reg(65), function(data) { $scope.wbCounters[13].stb = data; }); 
        socket.ipbus_read(counter_reg(66), function(data) { $scope.wbCounters[14].stb = data; }); 
        socket.ipbus_read(counter_reg(67), function(data) { $scope.wbCounters[15].stb = data; }); 
        socket.ipbus_read(counter_reg(68), function(data) { $scope.wbCounters[16].stb = data; }); 
        socket.ipbus_read(counter_reg(69), function(data) { $scope.wbCounters[17].stb = data; }); 
        // Slave acknowledgments        
        socket.ipbus_read(counter_reg(70), function(data) { $scope.wbCounters[4].ack = data; }); 
        socket.ipbus_read(counter_reg(71), function(data) { $scope.wbCounters[5].ack = data; }); 
        socket.ipbus_read(counter_reg(72), function(data) { $scope.wbCounters[6].ack = data; }); 
        socket.ipbus_read(counter_reg(73), function(data) { $scope.wbCounters[7].ack = data; }); 
        socket.ipbus_read(counter_reg(74), function(data) { $scope.wbCounters[8].ack = data; }); 
        socket.ipbus_read(counter_reg(75), function(data) { $scope.wbCounters[9].ack = data; }); 
        socket.ipbus_read(counter_reg(76), function(data) { $scope.wbCounters[10].ack = data; }); 
        socket.ipbus_read(counter_reg(77), function(data) { $scope.wbCounters[11].ack = data; }); 
        socket.ipbus_read(counter_reg(78), function(data) { $scope.wbCounters[12].ack = data; }); 
        socket.ipbus_read(counter_reg(49), function(data) { $scope.wbCounters[13].ack = data; }); 
        socket.ipbus_read(counter_reg(80), function(data) { $scope.wbCounters[14].ack = data; }); 
        socket.ipbus_read(counter_reg(81), function(data) { $scope.wbCounters[15].ack = data; }); 
        socket.ipbus_read(counter_reg(82), function(data) { $scope.wbCounters[16].ack = data; }); 
        socket.ipbus_read(counter_reg(83), function(data) { $scope.wbCounters[17].ack = data; }); 
    }

    function get_status_loop() {
        get_oh_counters();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.reset_counters = function() {       
        for (var i = 48; i <= 83; ++i) socket.ipbus_write(counter_reg(i), 0);
        get_oh_counters();
    };

}]);