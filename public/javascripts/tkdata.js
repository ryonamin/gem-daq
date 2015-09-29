app.controller('appCtrl', ['$scope', 'socket', function($scope, socket) {    
    
    var OHID = (window.sessionStorage === undefined ? 0 : window.sessionStorage.OHID);

    $scope.enableReadout = false;

    var readOutBuffer = [];

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

    var plotDataChipID = [ ['ChipID'] ];

    var plotDataEC = [ ['Event Counter'] ];

    var plotDataStrips = [ ['Strips'] ];

    $scope.toggle_readout = function() {
        $scope.enableReadout = !$scope.enableReadout;
    };

    $scope.reset_module = function() {
        $scope.tkDataEvents = []; 
        plotDataChipID = [ ['ChipID'] ];
        plotDataEC = [ ['Event Counter'] ];
        plotDataStrips = [ ['Strips'] ];
        plot_graphs();
        socket.ipbus_write(tkdata_reg(OHID), 0);
    };

    function plot_graph(id, title, data) {
        var chartData = google.visualization.arrayToDataTable(data);

        var options = {
            title: title,
            hAxis: { title: title },
            height: 300,
            legend: { position: 'none' },
            histogram: { bucketSize: 1 }
        };  

        var chart = new google.visualization.Histogram(document.getElementById(id));
        chart.draw(chartData, options);        
    }

    function plot_graphs() {
        plot_graph("chipid_chart", "Chip ID", plotDataChipID);
        plot_graph("ec_chart", "Event Counter", plotDataEC);
        plot_graph("strips_chart", "Beam Profile", plotDataStrips);
    }

    function form_vfat2_event() {     
        if (readOutBuffer.length < 6) return;  
        packet0 = readOutBuffer.shift();            
        if (((packet0 >> 28) & 0xf) != 0xA) return;
        packet1 = readOutBuffer.shift();    
        packet2 = readOutBuffer.shift(); 
        packet3 = readOutBuffer.shift(); 
        packet4 = readOutBuffer.shift(); 
        packet5 = readOutBuffer.shift(); 

        var bc = (0x0fff0000 & packet0) >> 16;
        var ec = (0x00000ff0 & packet0) >> 4;
        var flags = packet0 & 0xf;
        var chipID = (0x0fff0000 & packet1) >> 16;
        var strips0 = ((0x0000ffff & packet1) << 16) | ((0xffff0000 & packet2) >> 16);
        var strips1 = ((0x0000ffff & packet2) << 16) | ((0xffff0000 & packet3) >> 16);
        var strips2 = ((0x0000ffff & packet3) << 16) | ((0xffff0000 & packet4) >> 16);
        var strips3 = ((0x0000ffff & packet4) << 16) | ((0xffff0000 & packet5) >> 16);
        var crc = 0x0000ffff & packet5;

        $scope.tkDataEvents.push({
            bc: bc,
            ec: ec,
            flags: flags,
            chipID: chipID,
            strips0: strips0,
            strips1: strips1,
            strips2: strips2,
            strips3: strips3,
            crc: crc
        });    
                       
        // Add to graphs
        plotDataChipID.push([ chipID ]);
        plotDataEC.push([ ec ]);

        for (var i = 0; i < 32; ++i) {
            if (((strips0 >> i) & 0x1) == 1) plotDataStrips.push([ i ]);
            if (((strips1 >> i) & 0x1) == 1) plotDataStrips.push([ i + 32 ]);
            if (((strips2 >> i) & 0x1) == 1) plotDataStrips.push([ i + 64 ]);
            if (((strips3 >> i) & 0x1) == 1) plotDataStrips.push([ i + 96 ]);
         }
        //
        plot_graphs();
    }

    function get_vfat2_event() {
        socket.ipbus_read(tkdata_reg(OHID), function(data) {
            if (data != 0xf423f) readOutBuffer.push(data);
        });
    }

    function get_status_loop() {
        if ($scope.enableReadout) get_vfat2_event();
        form_vfat2_event();
        setTimeout(get_status_loop, 100);
    }

    get_status_loop();

}]);