app.controller('i2cCtrl', ['$scope', 'socket', function($scope, socket) {    

        $scope.dispRegisters = {
            "Control 0": 0,
            "Control 1": 1,
            "Control 2": 149,
            "Control 3": 150,
            "iPreampIn": 2,
            "iPreampFeed": 3,
            "iPreampOut": 4,
            "iShaper": 5,
            "iShaperFeed": 6,
            "iComp": 7,
            "ChipID 0": 8,
            "ChipID 1": 9,
            "Upset Register": 10,
            "HitCounter 0": 11,
            "HitCounter 1": 12,
            "HitCounter 2": 13,
            "Extended Pointer": 14,
            "Extended Data": 15,
            "Latency": 16,
            "VThreshold 1": 146,
            "VThreshold 2": 147,
            "Calphase": 148,
            "VCal": 145,
            "ChannelReg 0": 17,      
            "ChannelReg 1": 18,      
            "ChannelReg 2": 19,      
            "ChannelReg 3": 20,      
            "ChannelReg 4": 21,      
            "ChannelReg 5": 22,      
            "ChannelReg 6": 23,      
            "ChannelReg 7": 24,      
            "ChannelReg 8": 25,      
            "ChannelReg 9": 26,      
            "ChannelReg 10": 27,     
            "ChannelReg 11": 28,     
            "ChannelReg 12": 29,     
            "ChannelReg 13": 30,     
            "ChannelReg 14": 31,     
            "ChannelReg 15": 32,     
            "ChannelReg 16": 33,     
            "ChannelReg 17": 34,     
            "ChannelReg 18": 35,     
            "ChannelReg 19": 36,     
            "ChannelReg 20": 37,     
            "ChannelReg 21": 38,     
            "ChannelReg 22": 39,     
            "ChannelReg 23": 40,     
            "ChannelReg 24": 41,     
            "ChannelReg 25": 42,     
            "ChannelReg 26": 43,     
            "ChannelReg 27": 44,     
            "ChannelReg 28": 45,     
            "ChannelReg 29": 46,     
            "ChannelReg 30": 47,     
            "ChannelReg 31": 48,     
            "ChannelReg 32": 49,     
            "ChannelReg 33": 50,     
            "ChannelReg 34": 51,     
            "ChannelReg 35": 52,     
            "ChannelReg 36": 53,     
            "ChannelReg 37": 54,     
            "ChannelReg 38": 55,     
            "ChannelReg 39": 56,     
            "ChannelReg 40": 57,     
            "ChannelReg 41": 58,     
            "ChannelReg 42": 59,     
            "ChannelReg 43": 60,     
            "ChannelReg 44": 61,     
            "ChannelReg 45": 62,     
            "ChannelReg 46": 63,     
            "ChannelReg 47": 64,     
            "ChannelReg 48": 65,     
            "ChannelReg 49": 66,     
            "ChannelReg 50": 67,     
            "ChannelReg 51": 68,     
            "ChannelReg 52": 69,     
            "ChannelReg 53": 70,     
            "ChannelReg 54": 71,     
            "ChannelReg 55": 72,     
            "ChannelReg 56": 73,     
            "ChannelReg 57": 74,     
            "ChannelReg 58": 75,     
            "ChannelReg 59": 76,     
            "ChannelReg 60": 77,     
            "ChannelReg 61": 78,     
            "ChannelReg 62": 79,     
            "ChannelReg 63": 80,     
            "ChannelReg 64": 81,     
            "ChannelReg 65": 82,     
            "ChannelReg 66": 83,     
            "ChannelReg 67": 84,     
            "ChannelReg 68": 85,     
            "ChannelReg 69": 86,     
            "ChannelReg 70": 87,     
            "ChannelReg 71": 88,     
            "ChannelReg 72": 89,     
            "ChannelReg 73": 90,     
            "ChannelReg 74": 91,     
            "ChannelReg 75": 92,     
            "ChannelReg 76": 93,     
            "ChannelReg 77": 94,     
            "ChannelReg 78": 95,     
            "ChannelReg 79": 96,     
            "ChannelReg 80": 97,     
            "ChannelReg 81": 98,     
            "ChannelReg 82": 99,     
            "ChannelReg 83": 100,    
            "ChannelReg 84": 101,    
            "ChannelReg 85": 102,    
            "ChannelReg 86": 103,    
            "ChannelReg 87": 104,    
            "ChannelReg 88": 105,    
            "ChannelReg 89": 106,    
            "ChannelReg 90": 107,    
            "ChannelReg 91": 108,    
            "ChannelReg 92": 109,    
            "ChannelReg 93": 110,    
            "ChannelReg 94": 111,    
            "ChannelReg 95": 112,    
            "ChannelReg 96": 113,    
            "ChannelReg 97": 114,    
            "ChannelReg 98": 115,    
            "ChannelReg 99": 116,    
            "ChannelReg 100": 117,   
            "ChannelReg 101": 118,   
            "ChannelReg 102": 119,   
            "ChannelReg 103": 120,   
            "ChannelReg 104": 121,   
            "ChannelReg 105": 122,   
            "ChannelReg 106": 123,   
            "ChannelReg 107": 124,   
            "ChannelReg 108": 125,   
            "ChannelReg 109": 126,   
            "ChannelReg 110": 127,   
            "ChannelReg 111": 128,   
            "ChannelReg 112": 129,   
            "ChannelReg 113": 130,   
            "ChannelReg 114": 131,   
            "ChannelReg 115": 132,   
            "ChannelReg 116": 133,   
            "ChannelReg 117": 134,   
            "ChannelReg 118": 135,   
            "ChannelReg 119": 136,   
            "ChannelReg 120": 137,   
            "ChannelReg 121": 138,   
            "ChannelReg 122": 139,   
            "ChannelReg 123": 140,   
            "ChannelReg 124": 141,   
            "ChannelReg 125": 142,   
            "ChannelReg 126": 143,   
            "ChannelReg 127": 144  
        };

        /* Single I2C request */

        $scope.vfat2ID = 0;

        $scope.vfat2Register = 0;

        $scope.vfat2Data = 0;

        $scope.readResult = null;

        $scope.writeResult = null;

        $scope.read = function() {      
            $scope.readResult = null;  
            $scope.writeResult = null;
            socket.ipbus_read(vfat2_reg($scope.vfat2ID, $scope.vfat2Register), function(data) { $scope.readResult = data; });
        };

        $scope.write = function() {
            $scope.readResult = null;  
            $scope.writeResult = null;
            socket.ipbus_write(vfat2_reg($scope.vfat2ID, $scope.vfat2Register), $scope.vfat2Data, function(data) { $scope.writeResult = true; });
        };

        /* Broadcasting */

        $scope.vfat2smask = "000000";

        $scope.vfat2sRegister = 0;

        $scope.vfat2sData = 0;

        $scope.opsResult = [];

        $scope.reads = function() {  
            $scope.opsResult = [];
            var mask = parseInt($scope.vfat2smask, 16);
            socket.ipbus_write(0x41000100, mask, function() { 
                socket.ipbus_read(ei2c_reg($scope.vfat2sRegister), function() {
                    for (var i = 0; i < 24; ++i) {
                        socket.ipbus_read(0x41000101, function(data) {
                            $scope.opsResult.push({
                                vfat2: (data >> 8) & 0xFF,
                                data: data & 0xFF
                            });
                        });
                    }
                });
            });
        };

        $scope.writes = function() {
            $scope.readResult = null;  
            $scope.writeResult = null;
            socket.ipbus_write(vfat2_reg($scope.vfat2ID, $scope.vfat2Register), $scope.vfat2Data, function(data) { $scope.writeResult = true; });
        };

}]);