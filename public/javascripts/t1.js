app.controller('t1Ctrl', ['$scope', 'socket', function($scope, socket) {    

    $scope.t1Status = false;

    $scope.mode = 0;

    $scope.t1Type = 0;

    $scope.nEvents = 0;

    $scope.interval = 10;

    $scope.delay = 5;
        
    function get_current_values() {
        socket.ipbus_read(0x43000001, function(data) { $scope.mode = data.toString(); });
        socket.ipbus_read(0x43000002, function(data) { $scope.t1Type = data.toString(); });
        socket.ipbus_read(0x43000003, function(data) { $scope.nEvents = data; });
        socket.ipbus_read(0x43000004, function(data) { $scope.interval = data; });
        socket.ipbus_read(0x43000005, function(data) { $scope.delay = data; });    
    };

    get_current_values();

    $scope.start_controller = function() {   
        socket.ipbus_write(0x43000001, $scope.mode);
        socket.ipbus_write(0x43000002, $scope.t1Type);
        socket.ipbus_write(0x43000003, $scope.nEvents);
        socket.ipbus_write(0x43000004, $scope.interval);
        socket.ipbus_write(0x43000005, $scope.delay);
        socket.ipbus_write(0x43000000, 1);
        is_controller_running();
    };

    $scope.stop_controller = function() {
        socket.ipbus_write(0x43000000, 0);
        is_controller_running();
    };

    $scope.reset_controller = function() {
        socket.ipbus_write(0x4300000F, 1);
        get_current_values();
    };
        
    function get_t1_status() {
        socket.ipbus_read(0x4300000E, function(data) { 
            $scope.t1Status = (data == 0 ? false : true);
        });    
    };

    function get_status_loop() {
        get_t1_status();
        setTimeout(get_status_loop, 1000);
    }

    get_status_loop();

}]);