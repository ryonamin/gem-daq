app.controller('homeCtrl', ['$scope', 'socket', function($scope, socket) {    

    /* Models */

    $scope.t1_is_running = false;

    $scope.scan_is_running = 0;

    $scope.vfat2s = [];

    /* Initialize the VFAT2s */

    for (var i = 0; i < 24; ++i) $scope.vfat2s.push({ 
        id: i, 
        isPresent: false,
        isOn: false
    });

    /* Get status*/
        
    function status() {        
        // Scan
        socket.ipbus_read(0x42000009, function(data) { 
            $scope.scan_is_running = data;
        }); 
        // T1
        socket.ipbus_read(0x4300000E, function(data) { 
            $scope.t1_is_running = (data == 0 ? false : true);
        });       
        // VFAT2 
        for (var i = 0; i < 24; ++i) get_vfat2_onoff(i); 
    };

    function status_loop() {
        status();
        //setTimeout(status_loop, 1000);
    }

    status_loop();

    /* VFAT2 Status */    

    function get_vfat2_onoff(vfat2) {
        socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { 
            if ((data) == 0 || ((data & 0xF000000) >> 24) == 0x5) $scope.vfat2s[vfat2].isPresent = false;
            else $scope.vfat2s[vfat2].isPresent = true; 
        });    
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) {
            if (((data & 0xF000000) >> 24) == 0x5 || (data & 0x1) == 0) $scope.vfat2s[vfat2].isOn = false;
            else $scope.vfat2s[vfat2].isOn = true;
        });        
    };

}]);