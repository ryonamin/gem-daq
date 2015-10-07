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
        { name: 'Trigger data link 0', cnt: 0 },
        { name: 'Tracking data link 1', cnt: 0 },
        { name: 'Trigger data link 1', cnt: 0 } 
    ];

    function get_glib_counters() {
        socket.ipbus_blockRead(glib_counter_reg(0), 18, function(data) { 
            $scope.ipbusCounters[0].stb = data[0];  
            $scope.ipbusCounters[1].stb = data[1];  
            $scope.ipbusCounters[2].stb = data[2];  
            $scope.ipbusCounters[3].stb = data[3];  
            $scope.ipbusCounters[4].stb = data[4]; 
            $scope.ipbusCounters[0].ack = data[5];  
            $scope.ipbusCounters[1].ack = data[6];  
            $scope.ipbusCounters[2].ack = data[7];  
            $scope.ipbusCounters[3].ack = data[8];  
            $scope.ipbusCounters[4].ack = data[9];  
            $scope.t1Counters[0].cnt = data[10];  
            $scope.t1Counters[1].cnt = data[11];  
            $scope.t1Counters[2].cnt = data[12];  
            $scope.t1Counters[3].cnt = data[13];  
            $scope.gtxCounters[0].cnt = data[14];  
            $scope.gtxCounters[1].cnt = data[16];  
            $scope.gtxCounters[2].cnt = data[15];  
            $scope.gtxCounters[3].cnt = data[17];   
        });
    }

    function get_status_loop() {
        get_glib_counters();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.reset_ipbus_counters = function() {       
        socket.ipbus_blockWrite(glib_counter_reg(0), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        get_glib_counters();
    };

    $scope.reset_t1_counters = function() {       
        socket.ipbus_blockWrite(glib_counter_reg(10), [0, 0, 0, 0]);
        get_glib_counters();
    };

    $scope.reset_gtx_counters = function() {   
        socket.ipbus_blockWrite(glib_counter_reg(14), [0, 0, 0, 0]);    
        get_glib_counters();
    };

}]);