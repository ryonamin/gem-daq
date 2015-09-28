app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {    

    var OHID = (window.sessionStorage === undefined ? 0 : window.sessionStorage.OHID);
    
    $scope.scanStatus = false;

    $scope.vfat2ID = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 0xFFFFFF;
        
    function get_current_values() {
        socket.ipbus_read(oh_scan_reg(OHID, 2), function(data) { $scope.vfat2ID = data; });
        socket.ipbus_read(oh_scan_reg(OHID, 4), function(data) { $scope.minVal = data; });
        socket.ipbus_read(oh_scan_reg(OHID, 5), function(data) { $scope.maxVal = data; });
        socket.ipbus_read(oh_scan_reg(OHID, 6), function(data) { $scope.steps = data; });
        socket.ipbus_read(oh_scan_reg(OHID, 7), function(data) { $scope.nEvents = data; });    
    };

    get_current_values();

    $scope.start_scan = function() {   
        socket.ipbus_write(oh_scan_reg(OHID, 1), 0);
        socket.ipbus_write(oh_scan_reg(OHID, 2), $scope.vfat2ID);
        socket.ipbus_write(oh_scan_reg(OHID, 4), $scope.minVal);
        socket.ipbus_write(oh_scan_reg(OHID, 5), $scope.maxVal);
        socket.ipbus_write(oh_scan_reg(OHID, 6), $scope.steps);
        socket.ipbus_write(oh_scan_reg(OHID, 7), $scope.nEvents);
        socket.ipbus_write(oh_scan_reg(OHID, 0), 1);
    };

    $scope.reset_scan = function() {
        socket.ipbus_write(oh_scan_reg(OHID, 10), 1);
        get_current_values();
    };

    $scope.plot_results = function() {
        var nSamples = $scope.maxVal - $scope.minVal;

        var chartData = new google.visualization.DataTable();
        chartData.addColumn('number', 'X');
        chartData.addColumn('number', 'Percentage');
        chartData.removeRows(0, chartData.getNumberOfRows());

        var options = {
            title: 'Threshold scan',
            hAxis: {
                title: 'Threshold (VFAT2 units)'
            },
            vAxis: {
                title: 'Hit percentage'
            },
            height: 300,
            legend: {
                position: 'none'
            }
        };  

        var chart = new google.visualization.LineChart(document.getElementById('threshold_chart'));

        for (var i = 0; i <= nSamples; ++i) {
            socket.ipbus_read(oh_scan_reg(OHID, 8), function(data) {
                chartData.addRow([ (data >> 24) & 0xFF, (data & 0x00FFFFFF) / (1. * $scope.nEvents) * 100 ]);
                chart.draw(chartData, options);
            });
        }
    };
        
    function get_scan_status() {
        socket.ipbus_read(oh_scan_reg(OHID, 9), function(data) { 
            $scope.scanStatus = (data == 0 ? false : true);
        });    
    };

    function get_status_loop() {
        get_scan_status();
        setTimeout(get_status_loop, 500);
    }

    get_status_loop();

    $scope.oh_change = function() {
        get_current_values();
        get_scan_status();
    };

}]);