app.controller('vfat2Ctrl', ['$scope', 'socket', function($scope, socket) {    

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
        socket.ipbus_read(0x4B000000, function(data) {
            for (var i = 0; i < 24; ++i) $scope.tkReadoutStatus[i].masked = (((data >> i) & 0x1) == 1 ? true : false);
        });         
    }
        
    function get_vfat2_summary(vfat2) {
        // Present ?
        socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { 
            $scope.vfat2Status[vfat2].isPresent = ((data) == 0 || ((data & 0xF000000) >> 24) == 0x5 ? false : true);
            $scope.vfat2Status[vfat2].chipId0 = data;     
        });    
        // ON / OFF ?
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) {
            $scope.vfat2Status[vfat2].isOn = (((data & 0xF000000) >> 24) == 0x5 || (data & 0x1) == 0 ? false : true);
            $scope.vfat2Status[vfat2].ctrl0 = data;
        });        
        // TK data counters
        socket.ipbus_read(counter_reg(vfat2), function(data) { $scope.tkReadoutStatus[vfat2].good = data; });
        socket.ipbus_read(counter_reg(vfat2 + 24), function(data) { $scope.tkReadoutStatus[vfat2].bad = data; });
    };

    function get_vfat2_details(vfat2) {        
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) { $scope.vfat2Status[vfat2].ctrl0 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 1), function(data) { $scope.vfat2Status[vfat2].ctrl1 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 149), function(data) { $scope.vfat2Status[vfat2].ctrl2 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 150), function(data) { $scope.vfat2Status[vfat2].ctrl3 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 2), function(data) { $scope.vfat2Status[vfat2].iPreampIn = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 3), function(data) { $scope.vfat2Status[vfat2].iPremapFeed = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 4), function(data) { $scope.vfat2Status[vfat2].iPreampOut = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 5), function(data) { $scope.vfat2Status[vfat2].iShaper = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 6), function(data) { $scope.vfat2Status[vfat2].iShaperFeed = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 7), function(data) { $scope.vfat2Status[vfat2].iComp = data; });   
        socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { $scope.vfat2Status[vfat2].chipId0 = data; });   
        socket.ipbus_read(vfat2_reg(vfat2, 9), function(data) { $scope.vfat2Status[vfat2].chipId1 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 16), function(data) { $scope.vfat2Status[vfat2].latency = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 146), function(data) { $scope.vfat2Status[vfat2].vthreshold1 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 147), function(data) { $scope.vfat2Status[vfat2].vthreshold2 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 145), function(data) { $scope.vfat2Status[vfat2].vcal = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 148), function(data) { $scope.vfat2Status[vfat2].calphase = data; });
    }

    function get_status_loop() {
        // Mask
        get_vfat2_mask();
        // Summary
        for (var i = 0; i < 24; ++i) get_vfat2_summary(i);
        // Details if needed    
        if ($scope.selectedVFAT2 != null) get_vfat2_details($scope.selectedVFAT2);
        // Loop
        setTimeout(get_status_loop, 5000);
    }

    get_status_loop();

    $scope.select_vfat2 = function(vfat2) {
        $scope.selectedVFAT2 = vfat2;
        get_vfat2_details(vfat2);
    };
    
    $scope.apply_defaults = function(vfat2) {
        // Write the changes        
        socket.ipbus_write(vfat2_reg(vfat2, 1), $scope.defaultVFAT2.ctrl1);
        socket.ipbus_write(vfat2_reg(vfat2, 149), $scope.defaultVFAT2.ctrl2);
        socket.ipbus_write(vfat2_reg(vfat2, 150), $scope.defaultVFAT2.ctrl3);
        socket.ipbus_write(vfat2_reg(vfat2, 2), $scope.defaultVFAT2.iPreampIn);
        socket.ipbus_write(vfat2_reg(vfat2, 3), $scope.defaultVFAT2.iPremapFeed);
        socket.ipbus_write(vfat2_reg(vfat2, 4), $scope.defaultVFAT2.iPreampOut);
        socket.ipbus_write(vfat2_reg(vfat2, 5), $scope.defaultVFAT2.iShaper);
        socket.ipbus_write(vfat2_reg(vfat2, 6), $scope.defaultVFAT2.iShaperFeed);
        socket.ipbus_write(vfat2_reg(vfat2, 7), $scope.defaultVFAT2.iComp);
        socket.ipbus_write(vfat2_reg(vfat2, 147), $scope.defaultVFAT2.vthreshold2);
        // Update the values
        get_vfat2_details(vfat2);
    };

    $scope.start_vfat2 = function(vfat2) {
        socket.ipbus_write(vfat2_reg(vfat2, 0), $scope.defaultVFAT2.ctrl0);
        get_vfat2_summary(vfat2);
    };

    $scope.stop_vfat2 = function(vfat2) {
        socket.ipbus_write(vfat2_reg(vfat2, 0), 0);
        get_vfat2_summary(vfat2);
    };

    $scope.apply_defaults_all = function() {
        for (var i = 0; i < 24; ++i) {
            if ($scope.vfat2Status[i].isPresent) $scope.apply_defaults(i);
        }
    };

    $scope.start_vfat2_all = function() {
        for (var i = 0; i < 24; ++i) {
            if ($scope.vfat2Status[i].isPresent) $scope.start_vfat2(i);
        }
    };

    $scope.stop_vfat2_all = function() {
        for (var i = 0; i < 24; ++i) {
            if ($scope.vfat2Status[i].isPresent) $scope.stop_vfat2(i);
        }
    };

    $scope.vfat2_toggle_mask = function(vfat2) {
        socket.ipbus_read(0x4B000000, function(data) {
            var bit = ((data >> vfat2) & 0x1);
            if (bit == 1) data &= ~(0x1 << vfat2);
            else data |= (0x1 << vfat2);
            socket.ipbus_write(0x4B000000, data);
            get_vfat2_mask();
        }); 
    };

    $scope.reset_counters = function() {
        for (var i = 0; i < 48; ++i) socket.ipbus_write(counter_reg(i), 0);
        for (var i = 0; i < 24; ++i) get_vfat2_summary(i);
    };

}]);