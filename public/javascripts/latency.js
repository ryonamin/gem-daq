app.controller('latencyCtrl', ['$scope', 'socket', function($scope, socket) {    

    /* Models */

    $scope.scan_is_running = false;

    $scope.vfat2ID = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 1000;

    /* Get the current values */
        
    function get_current_values() {
        socket.ipbus_read(0x42000002, function(data) { $scope.vfat2ID = data; });
        socket.ipbus_read(0x42000004, function(data) { $scope.minVal = data; });
        socket.ipbus_read(0x42000005, function(data) { $scope.maxVal = data; });
        socket.ipbus_read(0x42000006, function(data) { $scope.steps = data; });
        socket.ipbus_read(0x42000007, function(data) { $scope.nEvents = data; });    
    };

    get_current_values();

    /* Launch the scan */

    $scope.start_scan = function() {   
        socket.ipbus_write(0x42000001, 2);
        socket.ipbus_write(0x42000002, $scope.vfat2ID);
        socket.ipbus_write(0x42000004, $scope.minVal);
        socket.ipbus_write(0x42000005, $scope.maxVal);
        socket.ipbus_write(0x42000006, $scope.steps);
        socket.ipbus_write(0x42000007, $scope.nEvents);
        socket.ipbus_write(0x42000000, 1);
    };

    /* Reset the module */

    $scope.reset_scan = function() {
        socket.ipbus_write(0x4200000A, 1);
        get_current_values();
    };

    /* Chart */

    $scope.get_results = function() {
        var nSamples = $scope.maxVal - $scope.minVal;

        var chartData = new google.visualization.DataTable();
        chartData.addColumn('number', 'X');
        chartData.addColumn('number', 'Percentage');
        chartData.removeRows(0, chartData.getNumberOfRows());

        var options = {
            hAxis: {
                title: 'Latency'
            },
            vAxis: {
                title: 'Percentage'
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

    /* Scan status */
        
    function is_scan_running() {
        socket.ipbus_read(0x42000009, function(data) { 
            $scope.scan_is_running = data;
        });    
    };

    function is_scan_running_loop() {
        is_scan_running();
        setTimeout(is_scan_running_loop, 500);
    }

    is_scan_running_loop();

}]);