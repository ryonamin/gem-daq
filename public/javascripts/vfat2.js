app.controller('vfat2Ctrl', ['$scope', 'socket', function($scope, socket) {    

    $scope.vfat2s = [];

    $scope.selectedVFAT2 = 99;
   
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

    /* Initialize empty VFAT2 holders */

    for (var i = 0; i < 24; ++i) $scope.vfat2s.push({
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


    /* Check if a VFAT2 is ON or OFF (and extract other information from the CTRL0 register) */
        
    function get_vfat2_onoff(vfat2) {
        socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { 
            if ((data) == 0 || ((data & 0xF000000) >> 24) == 0x5) $scope.vfat2s[vfat2].isPresent = false;
            else $scope.vfat2s[vfat2].isPresent = true; 
            $scope.vfat2s[vfat2].chipId0 = data;     
        });    
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) {
            if (((data & 0xF000000) >> 24) == 0x5 || (data & 0x1) == 0) $scope.vfat2s[vfat2].isOn = false;
            else $scope.vfat2s[vfat2].isOn = true;
            $scope.vfat2s[vfat2].ctrl0 = data;
        });        
    };

    function get_vfat2_onoff_loop() {
        for (var i = 0; i < 24; ++i) get_vfat2_onoff(i);
        setTimeout(get_vfat2_onoff_loop, 10000);
    }

    get_vfat2_onoff_loop();


    /* Readout all the registers from a VFAT2 */

    function get_vfat2_details(vfat2) {        
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) { $scope.vfat2s[vfat2].ctrl0 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 1), function(data) { $scope.vfat2s[vfat2].ctrl1 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 149), function(data) { $scope.vfat2s[vfat2].ctrl2 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 150), function(data) { $scope.vfat2s[vfat2].ctrl3 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 2), function(data) { $scope.vfat2s[vfat2].iPreampIn = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 3), function(data) { $scope.vfat2s[vfat2].iPremapFeed = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 4), function(data) { $scope.vfat2s[vfat2].iPreampOut = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 5), function(data) { $scope.vfat2s[vfat2].iShaper = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 6), function(data) { $scope.vfat2s[vfat2].iShaperFeed = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 7), function(data) { $scope.vfat2s[vfat2].iComp = data; });   
        socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { $scope.vfat2s[vfat2].chipId0 = data; });   
        socket.ipbus_read(vfat2_reg(vfat2, 9), function(data) { $scope.vfat2s[vfat2].chipId1 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 16), function(data) { $scope.vfat2s[vfat2].latency = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 146), function(data) { $scope.vfat2s[vfat2].vthreshold1 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 147), function(data) { $scope.vfat2s[vfat2].vthreshold2 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 145), function(data) { $scope.vfat2s[vfat2].vcal = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 148), function(data) { $scope.vfat2s[vfat2].calphase = data; });
    }

    /* Open the modal dialog */

    $scope.vfat2Inspect = function(vfat2) {
        $scope.selectedVFAT2 = vfat2;
        get_vfat2_details(vfat2);
    };


    /* Restore the default parameters of a VFAT2 */
    
    $scope.restore_defaults = function(vfat2) {
        if (vfat2 === undefined) vfat2 = $scope.selectedVFAT2;
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
        socket.ipbus_read(vfat2_reg(vfat2, 1), function(data) { $scope.vfat2s[vfat2].ctrl1 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 149), function(data) { $scope.vfat2s[vfat2].ctrl2 = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 150), function(data) { $scope.vfat2s[vfat2].ctrl3 = data; });        
        socket.ipbus_read(vfat2_reg(vfat2, 2), function(data) { $scope.vfat2s[vfat2].iPreampIn = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 3), function(data) { $scope.vfat2s[vfat2].iPremapFeed = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 4), function(data) { $scope.vfat2s[vfat2].iPreampOut = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 5), function(data) { $scope.vfat2s[vfat2].iShaper = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 6), function(data) { $scope.vfat2s[vfat2].iShaperFeed = data; });
        socket.ipbus_read(vfat2_reg(vfat2, 7), function(data) { $scope.vfat2s[vfat2].iComp = data; });   
        socket.ipbus_read(vfat2_reg(vfat2, 147), function(data) { $scope.vfat2s[vfat2].vthreshold2 = data; });
    };


    /* Start and stop the VFAT2 */

    $scope.start_vfat2 = function(vfat2) {
        if (vfat2 === undefined) vfat2 = $scope.selectedVFAT2;
        socket.ipbus_write(vfat2_reg(vfat2, 0), $scope.defaultVFAT2.ctrl0);
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) { $scope.vfat2s[vfat2].ctrl0 = data; });
        get_vfat2_onoff(vfat2);
    };

    $scope.stop_vfat2 = function(vfat2) {
        if (vfat2 === undefined) vfat2 = $scope.selectedVFAT2;
        socket.ipbus_write(vfat2_reg(vfat2, 0), 0);
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) { $scope.vfat2s[vfat2].ctrl0 = data; });
        get_vfat2_onoff(vfat2);
    };


    /* Apply to all VFAT2s */

    $scope.restore_defaults_all = function() {
        for (var i = 0; i < 24; ++i) {
            if ($scope.vfat2s[i].isPresent) $scope.restore_defaults(i);
        }
    };

    $scope.start_vfat2_all = function() {
        for (var i = 0; i < 24; ++i) {
            if ($scope.vfat2s[i].isPresent) $scope.start_vfat2(i);
        }
    };

    $scope.stop_vfat2_all = function() {
        for (var i = 0; i < 24; ++i) {
            if ($scope.vfat2s[i].isPresent) $scope.stop_vfat2(i);
        }
    };

}]);