app.controller('glibCtrl', ['$scope', 'socket', function($scope, socket) {
  
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

    /* Get the data about a single optical link */

    function get_link_data(link) {
        socket.ipbus_read(addr_link(0x40040000, link), function(data) { $scope.opticalLinks[link].error_counter = data; });
        socket.ipbus_read(addr_link(0x40040001, link), function(data) { $scope.opticalLinks[link].vfat2_rx_counter = data; });
        socket.ipbus_read(addr_link(0x40040002, link), function(data) { $scope.opticalLinks[link].vfat2_tx_counter = data; });
        socket.ipbus_read(addr_link(0x40040003, link), function(data) { $scope.opticalLinks[link].reg_rx_counter = data; });
        socket.ipbus_read(addr_link(0x40040004, link), function(data) { $scope.opticalLinks[link].reg_tx_counter = data; });
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
        socket.ipbus_write(addr_link(0x40040005, link), 1);
        socket.ipbus_write(addr_link(0x40040006, link), 1);
        socket.ipbus_write(addr_link(0x40040007, link), 1);
        socket.ipbus_write(addr_link(0x40040008, link), 1);
        socket.ipbus_write(addr_link(0x40040009, link), 1);
        get_link_data(link);
    }
    
}]);