app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {    

    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));
    
    $scope.scanStatus = false;

    $scope.vfat2ID = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 0xFFFFFF;
        
    function get_current_values() {
        socket.ipbus_blockRead(oh_scan_reg(OHID, 2), 6, function(data) { 
            $scope.vfat2ID = data[0];
            $scope.minVal = data[2];
            $scope.maxVal = data[3];
            $scope.steps = data[4];
            $scope.nEvents = data[5]; 
        });    
    }

    get_current_values();

    $scope.start_scan = function() {   
        socket.ipbus_blockWrite(oh_scan_reg(OHID, 1), [ 0, $scope.vfat2ID, 0, $scope.minVal, $scope.maxVal, $scope.steps, $scope.nEvents ]);
        socket.ipbus_write(oh_scan_reg(OHID, 0), 1);  
        $scope.scanStatus = true; 
        check_results();
    };
        
    function check_results() {
        socket.ipbus_read(oh_scan_reg(OHID, 9), function(data) { 
            $scope.scanStatus = (data == 0 ? false : true);
            if (!$scope.scanStatus) plot_results(); 
            else setTimeout(check_results, 500);
        });    
    };

    $scope.reset_scan = function() {
        socket.ipbus_write(oh_scan_reg(OHID, 10), 1);
        get_current_values();
    };

    function plot_results() {
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

        socket.ipbus_fifoRead(oh_scan_reg(OHID, 8), nSamples, function(data) {
            for (var i = 0; i <= data.length; ++i) {
                chartData.addRow([ (data[i] >> 24) & 0xFF, (data[i] & 0x00FFFFFF) / (1. * $scope.nEvents) * 100 ]);
                chart.draw(chartData, options);
            }
        });
    };

}]);