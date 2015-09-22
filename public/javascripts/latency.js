app.controller('latencyCtrl', ['$scope', 'socket', function($scope, socket) {    

    $scope.scan_is_running = false;

    $scope.vfat2ID = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 0xFFFFFF;
        
    function get_current_values() {
        socket.ipbus_read(0x42000002, function(data) { $scope.vfat2ID = data; });
        socket.ipbus_read(0x42000004, function(data) { $scope.minVal = data; });
        socket.ipbus_read(0x42000005, function(data) { $scope.maxVal = data; });
        socket.ipbus_read(0x42000006, function(data) { $scope.steps = data; });
        socket.ipbus_read(0x42000007, function(data) { $scope.nEvents = data; });    
    };

    get_current_values();

    $scope.start_scan = function() {   
        socket.ipbus_write(0x42000001, 2);
        socket.ipbus_write(0x42000002, $scope.vfat2ID);
        socket.ipbus_write(0x42000004, $scope.minVal);
        socket.ipbus_write(0x42000005, $scope.maxVal);
        socket.ipbus_write(0x42000006, $scope.steps);
        socket.ipbus_write(0x42000007, $scope.nEvents);
        socket.ipbus_write(0x42000000, 1);
    };

    $scope.reset_scan = function() {
        socket.ipbus_write(0x4200000A, 1);
        get_current_values();
    };

    $scope.plot_results = function() {
        var nSamples = $scope.maxVal - $scope.minVal;

        var chartData = new google.visualization.DataTable();
        chartData.addColumn('number', 'X');
        chartData.addColumn('number', 'Percentage');
        chartData.removeRows(0, chartData.getNumberOfRows());

        var options = {
            title: 'Latency scan',
            hAxis: {
                title: 'Latency (BX)'
            },
            vAxis: {
                title: 'Hit percentage'
            },
            height: 300,
            legend: {
                position: 'none'
            }
        };  

        var chart = new google.visualization.LineChart(document.getElementById('latency_chart'));

        for (var i = 0; i <= nSamples; ++i) {
            socket.ipbus_read(0x42000008, function(data) {
                chartData.addRow([ (data >> 24) & 0xFF, (data & 0x00FFFFFF) / (1. * $scope.nEvents) * 100 ]);
                chart.draw(chartData, options);
            });
        }
    };
        
    function get_scan_status() {
        socket.ipbus_read(0x42000009, function(data) { 
            $scope.scanStatus = (data == 0 ? false : true);
        });    
    };

    function get_status_loop() {
        get_scan_status();
        setTimeout(get_status_loop, 500);
    }

    get_status_loop();

}]);