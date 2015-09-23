app.controller('homeCtrl', ['$scope', 'socket', function($scope, socket) {    

    $scope.t1Status = false;

    $scope.scanStatus = 0;

    $scope.vfat2Status = [];

    for (var i = 0; i < 24; ++i) $scope.vfat2Status.push({ 
        id: i, 
        isPresent: false,
        isOn: false
    }); 

    function get_oh_status() {
        socket.ipbus_read(0x42000009, function(data) { $scope.scanStatus = data; }); 
        socket.ipbus_read(0x4300000E, function(data) { $scope.t1Status = (data == 0 ? false : true); }); 
    }

    function get_vfat2_status(vfat2) {
        socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { $scope.vfat2Status[vfat2].isPresent = ((data & 0xff) == 0 || ((data & 0xF000000) >> 24) == 0x5 ? false : true); });    
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) { $scope.vfat2Status[vfat2].isOn = (((data & 0xF000000) >> 24) == 0x5 || (data & 0x1) == 0 ? false : true); });        
    };
        
    function get_status_loop() {
        get_oh_status();       
        for (var i = 0; i < 24; ++i) get_vfat2_status(i); 
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

}]);