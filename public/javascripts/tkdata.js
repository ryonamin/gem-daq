app.controller('appCtrl', ['$scope', 'socket', 'Notification', function($scope, socket, Notification) {    
    
    var OHID = (window.sessionStorage.OHID == undefined ? 0 : parseInt(window.sessionStorage.OHID));

    $scope.enableReadout = false;

    var readOutBuffer = [];

    $scope.tkDataEvents = []; 

    $scope.nAcquired = 0; 

    $scope.tkEventsAvailable = 0;

    $scope.nSent = 0;

    $scope.nReceived = 0;

    var plotDataBC = [ ['Bunch Counter'] ];
    var plotDataEC = [ ['Event Counter'] ];
    var plotDataFlags = [ ['Flags'] ];
    var plotDataChipID = [ ['ChipID'] ];
    var plotDataStrips = [ ['Strips'] ];

    $scope.toggle_readout = function() {
        $scope.enableReadout = !$scope.enableReadout;
    };

    $scope.reset_module = function() {
        $scope.tkDataEvents = []; 
        $scope.nAcquired = 0;
        plotDataBC = [ [ 'Bunch Counter' ] ];
        plotDataEC = [ ['Event Counter'] ];
        plotDataFlags = [ ['Flags'] ];
        plotDataChipID = [ ['ChipID'] ];
        plotDataStrips = [ ['Strips'] ];
        plot_graphs();
        socket.ipbus_write(tkdata_reg(OHID), 0);
        socket.ipbus_write(oh_counter_reg(OHID, 106), 0);
        socket.ipbus_write(glib_counter_reg(18 + OHID), 0, function() { Notification.primary('The buffers have been emptied'); });
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
        plot_graph("bc_chart", "Bunch Counter", plotDataBC);
        plot_graph("ec_chart", "Event Counter", plotDataEC);
        plot_graph("flags_chart", "Flags", plotDataFlags);
        plot_graph("chipid_chart", "Chip ID", plotDataChipID);
        plot_graph("strips_chart", "Beam Profile", plotDataStrips);
        setTimeout(plot_graphs, 1000);
    }

    plot_graphs();

    function form_vfat2_event() {     
        packet0 = readOutBuffer.shift();            
        if (((packet0 >> 28) & 0xf) != 0xA) return;
        packet1 = readOutBuffer.shift();    
        packet2 = readOutBuffer.shift(); 
        packet3 = readOutBuffer.shift(); 
        packet4 = readOutBuffer.shift(); 
        packet5 = readOutBuffer.shift(); 
        packet6 = readOutBuffer.shift(); 

        var bc = (0x0fff0000 & packet0) >> 16;
        var ec = (0x00000ff0 & packet0) >> 4;
        var flags = packet0 & 0xf;
        var chipID = (0x0fff0000 & packet1) >> 16;
        var strips0 = ((0x0000ffff & packet1) << 16) | ((0xffff0000 & packet2) >> 16);
        var strips1 = ((0x0000ffff & packet2) << 16) | ((0xffff0000 & packet3) >> 16);
        var strips2 = ((0x0000ffff & packet3) << 16) | ((0xffff0000 & packet4) >> 16);
        var strips3 = ((0x0000ffff & packet4) << 16) | ((0xffff0000 & packet5) >> 16);
        var crc = 0x0000ffff & packet5;

        if ($scope.tkDataEvents.length >= 20) $scope.tkDataEvents.shift();

        $scope.tkDataEvents.push({
            bx: packet6,
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
        plotDataBC.push([ bc ]);
        plotDataEC.push([ ec ]);
        plotDataFlags.push([ flags ]);
        plotDataChipID.push([ chipID ]);

        for (var i = 0; i < 32; ++i) {
            if (((strips0 >> i) & 0x1) == 1) plotDataStrips.push([ i ]);
            if (((strips1 >> i) & 0x1) == 1) plotDataStrips.push([ i + 32 ]);
            if (((strips2 >> i) & 0x1) == 1) plotDataStrips.push([ i + 64 ]);
            if (((strips3 >> i) & 0x1) == 1) plotDataStrips.push([ i + 96 ]);
        }

        ++$scope.nAcquired;
    }

    function get_vfat2_event() {
        socket.ipbus_read(tkdata_reg(OHID, 1), function(data) {            
            socket.ipbus_fifoRead(tkdata_reg(OHID, 0), (data > 100 ? 100 : data), function(data) { readOutBuffer = readOutBuffer.concat(data); });
        });
    }

    function get_status_loop() {
        if ($scope.enableReadout) get_vfat2_event();
        if (readOutBuffer.length > 7) form_vfat2_event();
        socket.ipbus_blockRead(tkdata_reg(OHID, 1), 3, function(data) { 
            $scope.tkEventsAvailable = Math.floor(data[0] / 7.);
            $scope.tkFifoFull = (data[1] == 1);
            $scope.tkFifoEmpty = (data[2] == 1); 
        });
        socket.ipbus_read(oh_counter_reg(OHID, 106), function(data) { $scope.nSent = data; });
        socket.ipbus_read(glib_counter_reg(18 + OHID), function(data) { $scope.nReceived = data; });
        setTimeout(get_status_loop, 100);
    }

    get_status_loop();

}]);