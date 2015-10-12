app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {   

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.vfat2Status = [];

    $scope.tkReadoutStatus = [];

    $scope.selectedVFAT2 = ((window.location.href.split('/'))[4] === undefined ? null : (window.location.href.split('/'))[4]); // Set in function of the URL
 
    $scope.defaultVFAT2 = {
        ctrl0: 55, 
        ctrl1: 0,
        ctrl2: 48,
        ctrl3: 0,
        iPreampIn: 168,
        iPremapFeed: 80,
        iPreampOut: 150,
        iShaper: 150,
        iShaperFeed: 150,
        iComp: 75,
        vthreshold2: 0
    };

    for (var i = 0; i < 24; ++i) $scope.vfat2Status.push({
        id: i,
        isPresent: false,
        isOn: false,
        ctrl0: 0, 
        ctrl1: 0,
        ctrl2: 0,
        ctrl3: 0,
        iPreampIn: 0,
        iPremapFeed: 0,
        iPreampOut: 0,
        iShaper: 0,
        iShaperFeed: 0,
        iComp: 0,
        chipId0: 0,
        chipId1: 0,
        latency: 0,
        vthreshold1: 0,
        vthreshold2: 0,
        vcal: 0,
        calphase: 0
    });

    for (var i = 0; i < 24; ++i) $scope.tkReadoutStatus.push({
        id: i,
        good: 0,
        bad: 0,
        masked: false
    });

    function get_vfat2_mask() {
        socket.ipbus_read(oh_system_reg(OHID, 0), function(data) {
            for (var i = 0; i < 24; ++i) $scope.tkReadoutStatus[i].masked = (((data >> i) & 0x1) == 1 ? true : false);
        });         
    }
        
    function get_vfat2_status() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_read(oh_ei2c_reg(OHID, 8));
        socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), 24, function(data) {
            for (var i = 0; i < data.length; ++i) $scope.vfat2Status[i].isPresent = ((data[i] & 0xff) == 0 || ((data[i] & 0xF000000) >> 24) == 0x5 ? false : true);
        });
        socket.ipbus_read(oh_ei2c_reg(OHID, 0));
        socket.ipbus_fifoRead(oh_ei2c_reg(OHID, 257), 24, function(data) {
            for (var i = 0; i < data.length; ++i) $scope.vfat2Status[i].isOn = (((data[i] & 0xF000000) >> 24) == 0x5 || (data[i] & 0x1) == 0 ? false : true);
        });   
        socket.ipbus_blockRead(oh_counter_reg(OHID, 36), 48, function(data) {
            for (var i = 0; i < 24; ++i) {
                $scope.tkReadoutStatus[i].good = data[i];
                $scope.tkReadoutStatus[i].bad = data[i + 24];
            }
        });        
        if ($scope.selectedVFAT2 == null) return;   
        socket.ipbus_blockRead(vfat2_reg(OHID, $scope.selectedVFAT2, 0), 10, function(data) { 
            $scope.vfat2Status[$scope.selectedVFAT2].ctrl0 = data[0] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].ctrl1 = data[1] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].iPreampIn = data[2] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].iPremapFeed = data[3] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].iPreampOut = data[4] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].iShaper = data[5] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].iShaperFeed = data[6] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].iComp = data[7] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].chipId0 = data[8] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].chipId1 = data[9] & 0xff; 
        });
        socket.ipbus_read(vfat2_reg(OHID, $scope.selectedVFAT2, 16), function(data) { $scope.vfat2Status[$scope.selectedVFAT2].latency = data & 0xff; });
        socket.ipbus_blockRead(vfat2_reg(OHID, $scope.selectedVFAT2, 145), 6, function(data) { 
            $scope.vfat2Status[$scope.selectedVFAT2].vcal = data[0] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].vthreshold1 = data[1] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].vthreshold2 = data[2] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].calphase = data[3] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].ctrl2 = data[4] & 0xff;
            $scope.vfat2Status[$scope.selectedVFAT2].ctrl3 = data[5] & 0xff; 
        });
    }

    function get_status_loop() {
        get_vfat2_mask();
        get_vfat2_status();
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.select_vfat2 = function(vfat2) {
        $scope.selectedVFAT2 = vfat2;
        get_vfat2_status();
    };
    
    $scope.apply_defaults = function(vfat2) {     
        socket.ipbus_blockWrite(vfat2_reg(OHID, vfat2, 1), [ 
            $scope.defaultVFAT2.ctrl1, 
            $scope.defaultVFAT2.iPreampIn, 
            $scope.defaultVFAT2.iPremapFeed, 
            $scope.defaultVFAT2.iPreampOut, 
            $scope.defaultVFAT2.iShaper,
            $scope.defaultVFAT2.iShaperFeed, 
            $scope.defaultVFAT2.iComp
        ]);
        socket.ipbus_write(vfat2_reg(OHID, vfat2, 147), $scope.defaultVFAT2.vthreshold2);
        socket.ipbus_blockWrite(vfat2_reg(OHID, vfat2, 149), [ $scope.defaultVFAT2.ctrl2, $scope.defaultVFAT2.ctrl3 ]);
        get_vfat2_status();
    };

    $scope.start_vfat2 = function(vfat2) {
        socket.ipbus_write(vfat2_reg(OHID, vfat2, 0), $scope.defaultVFAT2.ctrl0);
        get_vfat2_status();
    };

    $scope.stop_vfat2 = function(vfat2) {
        socket.ipbus_write(vfat2_reg(OHID, vfat2, 0), 0);
        get_vfat2_status();
    };

    $scope.apply_defaults_all = function() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_blockWrite(oh_ei2c_reg(OHID, 1), [ 
            $scope.defaultVFAT2.ctrl1, 
            $scope.defaultVFAT2.iPreampIn, 
            $scope.defaultVFAT2.iPremapFeed, 
            $scope.defaultVFAT2.iPreampOut, 
            $scope.defaultVFAT2.iShaper,
            $scope.defaultVFAT2.iShaperFeed, 
            $scope.defaultVFAT2.iComp
        ]);
        socket.ipbus_write(oh_ei2c_reg(OHID, 147), $scope.defaultVFAT2.vthreshold2);
        socket.ipbus_blockWrite(oh_ei2c_reg(OHID, 149), [ $scope.defaultVFAT2.ctrl2, $scope.defaultVFAT2.ctrl3 ]);
        get_vfat2_status();
    };

    $scope.start_vfat2_all = function() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_write(oh_ei2c_reg(OHID, 0), $scope.defaultVFAT2.ctrl0);
        get_vfat2_status();
    };

    $scope.stop_vfat2_all = function() {
        socket.ipbus_write(oh_ei2c_reg(OHID, 256), 0);
        socket.ipbus_write(oh_ei2c_reg(OHID, 0), 0);
        get_vfat2_status();
    };

    $scope.reset_vfat2_all = function() {
        socket.ipbus_write(0x4B000002, 0);
        get_vfat2_status();
    };

    $scope.vfat2_toggle_mask = function(vfat2) {
        socket.ipbus_read(oh_system_reg(OHID, 0), function(data) {
            var bit = ((data >> vfat2) & 0x1);
            if (bit == 1) data &= ~(0x1 << vfat2);
            else data |= (0x1 << vfat2);
            socket.ipbus_write(oh_system_reg(OHID, 0), data);
            get_vfat2_mask();
        }); 
    };

    $scope.reset_counters = function() {
        socket.ipbus_blockWrite(oh_counter_reg(OHID, 36), [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
        get_vfat2_status();
    };
    
}]);