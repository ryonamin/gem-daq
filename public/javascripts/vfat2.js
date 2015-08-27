app.controller('vfat2Ctrl', ['$scope', 'socket', function($scope, socket) {    

    $scope.vfat2s = [];
    $scope.inspectinVFAT2 = 99;
    $scope.writeVFAT2 = {
        id: i,
        isPresent: false,
        isOn: false,
        triggerMode: 0, 
        msPolarity: 0,
        calPolarity: 0,
        calMode: 0,
        dacSel: 0,
        hitCounterSel: 0,
        msPulseLength: 0,
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
        vacl: 0
    };

    /* Initialize empty VFAT2 holders */

    for (var i = 0; i < 24; ++i) $scope.vfat2s.push({
        id: i,
        isPresent: false,
        isOn: false,
        triggerMode: 0, 
        msPolarity: 0,
        calPolarity: 0,
        calMode: 0,
        dacSel: 0,
        hitCounterSel: 0,
        msPulseLength: 0,
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
        vacl: 0
    });

    /* Check if a VFAT2 is ON or OFF (and extract other information from the CTRL0 register) */
        
    function get_vfat2_onoff(vfat2) {
        socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { 
            if ((data & 0xFF) == 0 || ((data & 0xF000000) >> 24) == 0x5) $scope.vfat2s[vfat2].isPresent = false;
            else $scope.vfat2s[vfat2].isPresent = true; 
            $scope.vfat2s[vfat2].chipId0 = data & 0xFF;     
        });    
        socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) {
            if (((data & 0xF000000) >> 24) == 0x5 || (data & 0x1) == 0) $scope.vfat2s[vfat2].isOn = false;
            else $scope.vfat2s[vfat2].isOn = true;
            $scope.vfat2s[vfat2].triggerMode = (data & 0xE) >> 1; 
            $scope.vfat2s[vfat2].msPolarity = (data & 0x10) >> 4; 
            $scope.vfat2s[vfat2].calPolarity = (data & 0x20) >> 5; 
            $scope.vfat2s[vfat2].calMode = (data & 0xC0) >> 6;
        });        
    };

    /* Loop to continuously check if VFAT2s are ON or OFF */

    function get_vfat2_onoff_loop() {
        for (var i = 0; i < 24; ++i) get_vfat2_onoff(i);
        setTimeout(get_vfat2_onoff_loop, 10000);
    }

    get_vfat2_onoff_loop();

    /* Readout all the registers from a VFAT2 */

    function get_vfat2_details(vfat2) {        
        /*socket.ipbus_read(vfat2_reg(vfat2, 0), function(data) {
            $scope.vfat2s[vfat2].isOn = (data & 0x1 == 1 ? true : false); 
            $scope.vfat2s[vfat2].triggerMode = (data & 0xE) >> 1; 
            $scope.vfat2s[vfat2].msPolarity = (data & 0x10) >> 4; 
            $scope.vfat2s[vfat2].calPolarity = (data & 0x20) >> 5; 
            $scope.vfat2s[vfat2].calMode = (data & 0xC0) >> 6;
        });*/        
        socket.ipbus_read(vfat2_reg(vfat2, 1), function(data) { $scope.vfat2s[vfat2].dacSel = data & 0xF; });
        socket.ipbus_read(vfat2_reg(vfat2, 149), function(data) { 
            $scope.vfat2s[vfat2].hitCounterSel = data & 0xF; 
            $scope.vfat2s[vfat2].msPulseLength = data & 0x70; 
        });
        socket.ipbus_read(vfat2_reg(vfat2, 2), function(data) { $scope.vfat2s[vfat2].iPreampIn = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 3), function(data) { $scope.vfat2s[vfat2].iPremapFeed = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 4), function(data) { $scope.vfat2s[vfat2].iPreampOut = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 5), function(data) { $scope.vfat2s[vfat2].iShaper = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 6), function(data) { $scope.vfat2s[vfat2].iShaperFeed = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 7), function(data) { $scope.vfat2s[vfat2].iComp = data & 0xFF; });        
        //socket.ipbus_read(vfat2_reg(vfat2, 8), function(data) { $scope.vfat2s[vfat2].chipId0 = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 9), function(data) { $scope.vfat2s[vfat2].chipId1 = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 16), function(data) { $scope.vfat2s[vfat2].latency = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 146), function(data) { $scope.vfat2s[vfat2].vthreshold1 = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 147), function(data) { $scope.vfat2s[vfat2].vthreshold2 = data & 0xFF; });
        socket.ipbus_read(vfat2_reg(vfat2, 145), function(data) { $scope.vfat2s[vfat2].vacl = data & 0xFF; });
    }

    /* Open the modal dialog */

    $scope.vfat2Inspect = function(vfat2) {
        $scope.inspectinVFAT2 = vfat2;
        get_vfat2_details(vfat2);
        $('#inspect_vfat2').foundation('reveal', 'open');
    };
    
}]);