app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {    

    var OHID = (window.sessionStorage === undefined ? 0 : window.sessionStorage.OHID);

    $scope.fifoFull = false;

    $scope.t1Status = false;

    $scope.scanStatus = 0;

    $scope.vfat2Status = [];

    for (var i = 0; i < 24; ++i) $scope.vfat2Status.push({ id: i, isPresent: false, isOn: false }); 

    function get_glib_status() {        
        socket.ipbus_read(tkdata_reg(OHID, 2), function(data) { $scope.fifoFull = (data == 1); });
    }

    function get_oh_status() {
        socket.ipbus_read(oh_scan_reg(OHID, 9), function(data) { $scope.scanStatus = data; }); 
        socket.ipbus_read(oh_t1_reg(OHID, 14), function(data) { $scope.t1Status = (data == 0 ? false : true); }); 
    }

    function get_vfat2_status(vfat2) {
        socket.ipbus_read(vfat2_reg(OHID, vfat2, 8), function(data) { $scope.vfat2Status[vfat2].isPresent = ((data & 0xff) == 0 || ((data & 0xF000000) >> 24) == 0x5 ? false : true); });    
        socket.ipbus_read(vfat2_reg(OHID, vfat2, 0), function(data) { $scope.vfat2Status[vfat2].isOn = (((data & 0xF000000) >> 24) == 0x5 || (data & 0x1) == 0 ? false : true); });        
    };
        
    function get_status_loop() {
        get_glib_status();
        get_oh_status();  
        for (var i = 0; i < 24; ++i) get_vfat2_status(i); 
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

}]);