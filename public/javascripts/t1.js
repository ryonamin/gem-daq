app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {    
    
    var OHID = (window.sessionStorage === undefined ? 0 : window.sessionStorage.OHID);

    $scope.t1Status = false;

    $scope.mode = 0;

    $scope.t1Type = 0;

    $scope.nEvents = 0;

    $scope.interval = 10;

    $scope.delay = 5;
        
    function get_current_values() {
        socket.ipbus_read(oh_t1_reg(OHID, 1), function(data) { $scope.mode = data.toString(); });
        socket.ipbus_read(oh_t1_reg(OHID, 2), function(data) { $scope.t1Type = data.toString(); });
        socket.ipbus_read(oh_t1_reg(OHID, 3), function(data) { $scope.nEvents = data; });
        socket.ipbus_read(oh_t1_reg(OHID, 4), function(data) { $scope.interval = data; });
        socket.ipbus_read(oh_t1_reg(OHID, 5), function(data) { $scope.delay = data; });    
    };

    get_current_values();

    $scope.start_controller = function() {   
        socket.ipbus_write(oh_t1_reg(OHID, 1), $scope.mode);
        socket.ipbus_write(oh_t1_reg(OHID, 2), $scope.t1Type);
        socket.ipbus_write(oh_t1_reg(OHID, 3), $scope.nEvents);
        socket.ipbus_write(oh_t1_reg(OHID, 4), $scope.interval);
        socket.ipbus_write(oh_t1_reg(OHID, 5), $scope.delay);
        socket.ipbus_write(oh_t1_reg(OHID, 0), 1);
        is_controller_running();
    };

    $scope.stop_controller = function() {
        socket.ipbus_write(oh_t1_reg(OHID, 0), 0);
        is_controller_running();
    };

    $scope.reset_controller = function() {
        socket.ipbus_write(oh_t1_reg(OHID, 15), 1);
        get_current_values();
    };
        
    function get_t1_status() {
        socket.ipbus_read(oh_t1_reg(OHID, 14), function(data) { 
            $scope.t1Status = (data == 0 ? false : true);
        });    
    };

    function get_status_loop() {
        get_t1_status();
        setTimeout(get_status_loop, 1000);
    }

    get_status_loop();

}]);