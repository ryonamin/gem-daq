app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {    
    
    var OHID = (window.sessionStorage === undefined ? 0 : window.sessionStorage.OHID);

    $scope.enableReadout = false;

    $scope.tkDataEvents = []; 

    var tmpEvent = {
        bc: 0,
        ec: 0,
        flags: 0,
        chipID: 0,
        strips0: 0,
        strips1: 0,
        strips2: 0,
        strips3: 0,
        crc: 0
    };

    var plotData = [
        ['ChipID']
    ];

    $scope.toggle_readout = function() {
        $scope.enableReadout = !$scope.enableReadout;
    };

    $scope.reset_module = function() {
        $scope.tkDataEvents = []; 
        socket.ipbus_write(tkdata_reg(OHID), 0);
    };

    function plot_graphs() {
        var chartData = google.visualization.arrayToDataTable(plotData);

        var options = {
            title: 'Chip ID',
            hAxis: {
                title: 'Chip ID'
            },
            height: 300,
            legend: {
                position: 'none'
            },
            histogram: {
                bucketSize: 2
            }
        };  

        var chart = new google.visualization.Histogram(document.getElementById('chipid_chart'));
        chart.draw(chartData, options);
    }

    function get_vfat2_event() {
        socket.ipbus_read(tkdata_reg(OHID), function(data) {
            if (((data >> 28) & 0xf) == 0xA) {
                tmpEvent.bc = ((data >> 16) & 0xFFF);
                tmpEvent.ec = ((data >> 4) & 0xFF);
                tmpEvent.flags = (data & 0xF);

                socket.ipbus_read(tkdata_reg(OHID), function(data) {
                    tmpEvent.chipID = ((data >> 16) & 0xFFF);
                });
                socket.ipbus_read(tkdata_reg(OHID));
                socket.ipbus_read(tkdata_reg(OHID));
                socket.ipbus_read(tkdata_reg(OHID));
                socket.ipbus_read(tkdata_reg(OHID), function(data) {
                    tmpEvent.CRC = (data & 0xFF); 
                    $scope.tkDataEvents.push({
                        bc: tmpEvent.bc,
                        ec: tmpEvent.ec,
                        flags: tmpEvent.flags,
                        chipID: tmpEvent.chipID,
                        strips0: tmpEvent.strips0,
                        strips1: tmpEvent.strips1,
                        strips2: tmpEvent.strips2,
                        strips3: tmpEvent.strips3,
                        crc: tmpEvent.crc
                    });       
                    plotData.push([ tmpEvent.chipID ]);
                    plot_graphs();
                });  
            }
        });
    }

    function get_status_loop() {
        if ($scope.enableReadout) get_vfat2_event();
        setTimeout(get_status_loop, 100);
    }

    get_status_loop();

}]);