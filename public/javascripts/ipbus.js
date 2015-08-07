var socket = io.connect('http://localhost:3000');

function ipbus_read(addr, clientCallback) {
    socket.emit('ipbus_read', { addr: addr }, function(response) {
        if (response.infoCode == 0x0) clientCallback(response.data);
        else clientCallback(null);
    });
}

function ipbus_write(addr, data) {
    socket.emit('ipbus_write', { addr: addr, data: data }, function(response) {
        if (response.infoCode == 0x0)  clientCallback(true);
        else clientCallback(false);
    });
}