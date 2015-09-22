app.controller('tkdataCtrl', ['$scope', 'socket', function($scope, socket) {    

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
        socket.ipbus_write(0x50000000, 0);
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
        socket.ipbus_read(0x50000000, function(data) {
            tmpEvent.bc = ((data >> 16) & 0xFFF);
            tmpEvent.ec = ((data >> 4) & 0xFF);
            tmpEvent.flags = (data & 0xF);
        });
        socket.ipbus_read(0x50000000, function(data) {
            tmpEvent.chipID = ((data >> 16) & 0xFFF);
        });
        socket.ipbus_read(0x50000000);
        socket.ipbus_read(0x50000000);
        socket.ipbus_read(0x50000000);
        socket.ipbus_read(0x50000000, function(data) {
            tmpEvent.CRC = (data & 0xFF); 
            if (tmpEvent.chipID != 0) {
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
            }
        });  
    }

    function get_status_loop() {
        if ($scope.enableReadout) get_vfat2_event();
        setTimeout(get_status_loop, 100);
    }

    get_status_loop();

}]);