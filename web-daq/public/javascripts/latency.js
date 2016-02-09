app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {    
    
    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    var chart = new google.visualization.LineChart(document.getElementById('latency_chart'));
    google.visualization.events.addListener(chart, 'select', selectHandler);

    var saveData = [];

    $scope.scanStatus = 0;

    $scope.vfat2ID = 0;

    $scope.channel = 0;

    $scope.minVal = 0;

    $scope.maxVal = 255;

    $scope.steps = 1;

    $scope.nEvents = 0xFFFFFF;
        
    function get_current_values() {
        socket.ipbus_blockRead(oh_scan_reg(OHID, 2), 6, function(data) { 
            $scope.vfat2ID = data[0];
            $scope.channel = data[1];
            $scope.minVal = data[2];
            $scope.maxVal = data[3];
            $scope.steps = data[4];
            $scope.nEvents = data[5]; 
        });    
    }

    get_current_values();

    $scope.start_scan = function() {   
        socket.ipbus_blockWrite(oh_scan_reg(OHID, 1), [ 2, $scope.vfat2ID, $scope.channel, $scope.minVal, $scope.maxVal, $scope.steps, $scope.nEvents ]);
        socket.ipbus_write(oh_scan_reg(OHID, 0), 1);
        $scope.scanStatus = 1; 
        check_results();
    };
        
    function check_results() {
        socket.ipbus_read(oh_scan_reg(OHID, 9), function(data) { 
            $scope.scanStatus = (data == 0 ? 2 : 1);
            if ($scope.scanStatus == 2) plot_results(); 
            else setTimeout(check_results, 500);
        });    
    };

    $scope.reset_scan = function() {
        socket.ipbus_write(oh_scan_reg(OHID, 10), 1, function() { Notification.primary('The module has been reset'); });
        get_current_values();
    };

    function plot_results() {
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

        socket.ipbus_fifoRead(oh_scan_reg(OHID, 8), nSamples, function(data) {
            saveData = data;
            for (var i = 0; i < data.length; ++i) chartData.addRow([ (data[i] >> 24) & 0xFF, (data[i] & 0x00FFFFFF) / (1. * $scope.nEvents) * 100 ]);
            chart.draw(chartData, options);
        });
    };

    function selectHandler() { 
        socket.ipbus_write(vfat2_reg(OHID, $scope.vfat2ID, 16), chart.getSelection()[0].row, function() { Notification.primary('The latency\'s value has been updated'); });
    }       

    $scope.save = function() {
        socket.save({
                type: 'latency', 
                data: saveData, 
                oh: OHID,
                vfat2: $scope.vfat2ID,
                min: $scope.minVal,
                max: $scope.maxVal,
                step: $scope.steps,
                n: $scope.nEvents
            },
            function() { Notification.primary('The data has been saved to disk'); }
        );
    };

}]);