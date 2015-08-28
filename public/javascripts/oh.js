app.controller('ohCtrl', ['$scope', 'socket', function($scope, socket) {
  
    $scope.opticalLinks = [
        {
            name: "Tracking Data 0",
            error_counter: 0,
            vfat2_rx_counter: 0,
            vfat2_tx_counter: 0,
            reg_rx_counter: 0,
            reg_tx_counter: 0,
        }, 
        {
            name: "Tracking Data 1",
            error_counter: 0,
            vfat2_rx_counter: 0,
            vfat2_tx_counter: 0,
            reg_rx_counter: 0,
            reg_tx_counter: 0
        }, 
        {
            name: "Tracking Data 2",
            error_counter: 0,
            vfat2_rx_counter: 0,
            vfat2_tx_counter: 0,
            reg_rx_counter: 0,
            reg_tx_counter: 0
        }
    ];

    $scope.fastSignals = {
        lv1a: 0,
        lv1a_ext: 0,
        lv1a_int: 0,
        lv1a_del: 0,
        calpulse: 0,
        calpulse_int: 0,
        calpulse_del: 0,
        bc0: 0,
        resync: 0,
        bx: 0
    };

    /* Get the data about a single optical link */

    function get_link_data(link) {
        socket.ipbus_read(addr_link(0x40030000, link), function(data) { $scope.opticalLinks[link].error_counter = data; });
        socket.ipbus_read(addr_link(0x40030001, link), function(data) { $scope.opticalLinks[link].vfat2_rx_counter = data; });
        socket.ipbus_read(addr_link(0x40030002, link), function(data) { $scope.opticalLinks[link].vfat2_tx_counter = data; });
        socket.ipbus_read(addr_link(0x40030003, link), function(data) { $scope.opticalLinks[link].reg_rx_counter = data; });
        socket.ipbus_read(addr_link(0x40030004, link), function(data) { $scope.opticalLinks[link].reg_tx_counter = data; });
    };

    /* Loop to continuously check the optical links */

    function get_link_data_loop() {
        get_link_data(0);
        get_link_data(1);
        get_link_data(2);
        setTimeout(get_link_data_loop, 5000);
    }

    get_link_data_loop();

    /* Reset the counters on the optical link */

    $scope.reset_link_counter = function(link) {
        socket.ipbus_write(addr_link(0x40030005, link), 1);
        socket.ipbus_write(addr_link(0x40030006, link), 1);
        socket.ipbus_write(addr_link(0x40030007, link), 1);
        socket.ipbus_write(addr_link(0x40030008, link), 1);
        socket.ipbus_write(addr_link(0x40030009, link), 1);
        get_link_data(link);
    }

    /* Get the fast signals data */

     function get_fast_data() {
        socket.ipbus_read(0x4003005A, function(data) { $scope.fastSignals.lv1a_ext = data; });
        socket.ipbus_read(0x4003005B, function(data) { $scope.fastSignals.lv1a_int = data; });
        socket.ipbus_read(0x4003005C, function(data) { $scope.fastSignals.lv1a_del = data; });
        socket.ipbus_read(0x4003005D, function(data) { $scope.fastSignals.lv1a = data; });
        socket.ipbus_read(0x4003005E, function(data) { $scope.fastSignals.calpulse_int = data; });
        socket.ipbus_read(0x4003005F, function(data) { $scope.fastSignals.calpulse_del = data; });
        socket.ipbus_read(0x40030060, function(data) { $scope.fastSignals.calpulse = data; });
        socket.ipbus_read(0x40030061, function(data) { $scope.fastSignals.resync = data; });
        socket.ipbus_read(0x40030062, function(data) { $scope.fastSignals.bc0 = data; });
        socket.ipbus_read(0x40030063, function(data) { $scope.fastSignals.bx = data; });
    };   

     function get_fast_data_loop() {
        get_fast_data();
        setTimeout(get_fast_data_loop, 5000);
    };   

    get_fast_data_loop();

    /* Reset the fast counters */

    $scope.reset_fast_data_counter = function() {
        socket.ipbus_write(0x40030066, 1);
        socket.ipbus_write(0x40030067, 1);
        socket.ipbus_write(0x40030068, 1);
        socket.ipbus_write(0x40030069, 1);
        socket.ipbus_write(0x4003006A, 1);
        socket.ipbus_write(0x4003006B, 1);
        socket.ipbus_write(0x4003006C, 1);
        socket.ipbus_write(0x4003006D, 1);
        socket.ipbus_write(0x4003006E, 1);
        get_fast_data();
    };
}]);