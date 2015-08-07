var dgram = require('dgram');
var udp = dgram.createSocket({ type: 'udp4', reuseAddr : true });

var ipaddr = "192.168.0.161";
var port = 50001;

var packetId = 0;
var packetsCallback = new Array();
var packetsTimeOut = new Array();


udp.bind();

/*
 * Receive responses
 */

udp.on('message', function(message) {
    // Response
    var data = {
        ipbusVersion: (message[0] >> 4),
        packetId: ((message[4] & 0xf) << 8) | message[5],
        packetType: (message[7] & 0xf0) >> 4,
        infoCode: (message[3] & 0x0f)
    }

    // Read
    if (data.packetType == 0) data.data = (message[8] << 24) | (message[9] << 16) | (message[10] << 8) | message[11];
    // Write
    else if (data.packetType == 1) data.data = 0;

    // Callback
    if (packetsCallback[data.packetId] !== undefined) {
        packetsCallback[data.packetId](data);
        delete packetsCallback[data.packetId];
        delete packetsTimeOut[data.packetId];
    }
    else console.log('UDP: received packet', data.packetId, 'but NO callback :(');
});

/*
 * Handle timeouts
 */

setInterval(function() {
    for (var i = 0; i < packetsTimeOut.length; ++i) {
        if (packetsTimeOut[i] !== undefined) {
            if (packetsTimeOut[i] != 0) --packetsTimeOut[i];
            else {
                var data = {
                    packetId: i,
                    packetType: null,
                    infoCode: 0x6,
                    data: null
                }
                packetsCallback[i](data);
                delete packetsCallback[i];
                delete packetsTimeOut[i];
                console.log('Timeout: transaction', i, 'timed out :(')
            }
        }
    }
}, 10); 

/*
 * Read function
 */

function ipbus_read(addr, localCallback) {
    var data = new Buffer([
        // Transaction Header
        0x20, // Protocol version & RSVD
        0x0, // Transaction ID (0 or bug)
        0x0, // Transaction ID (0 or bug)
        0xf0, // Packet order & type
        // Packet Header
        (0x20 | ((packetId & 0xf00) >> 8)), // Protocol version & Packet ID MSB
        (packetId & 0xff), // Packet ID MSB,
        0x1, // Words
        0x0f, // Type & Info code
        // Read address
        ((addr & 0xff000000) >> 24),
        ((addr & 0x00ff0000) >> 16),
        ((addr & 0x0000ff00) >> 8),
        (addr & 0x000000ff)
    ]);

    packetsCallback[packetId] = localCallback;
    packetsTimeOut[packetId] = 100;
    packetId = (packetId == 100 ? 0 : ++packetId); 

    udp.send(data, 0, data.length, port, ipaddr);        
};

/*
 * Write function
 */

function ipbus_write(addr, val, localCallback) {
    var data = new Buffer([
        // Transaction Header
        0x20, // Protocol version & RSVD
        0x0, // Transaction ID (0 or bug)
        0x0, // Transaction ID (0 or bug)
        0xf0, // Packet order & type
        // Packet Header
        (0x20 | ((packetId & 0xf00) >> 8)), // Protocol version & Packet ID MSB
        (packetId & 0x0ff), // Packet ID MSB,
        0x1, // Words
        0x1f, // Type & Info code
        // Write address
        ((addr & 0xff000000) >> 24),
        ((addr & 0x00ff0000) >> 16),
        ((addr & 0x0000ff00) >> 8),
        (addr & 0x000000ff),
        // Write data
        ((val & 0xff000000) >> 24),
        ((val & 0x00ff0000) >> 16),
        ((val & 0x0000ff00) >> 8),
        (val & 0x000000ff)
    ]);

    packetsCallback[packetId] = localCallback;
    packetsTimeOut[packetId] = 100;
    packetId = (packetId == 100 ? 0 : ++packetId); 

    udp.send(data, 0, data.length, port, ipaddr);       
};

/*
 * Socket IO interface
 */

module.exports = function(io) {

    io.on('connection', function (socket) {

        // IPBus read
        socket.on('ipbus_read', function(request, clientCallback) {
            ipbus_read(request.addr, function(response) {
                clientCallback(response);
            });
        });

        // IPBus write
        socket.on('ipbus_write', function(request, clientCallback) {
            ipbus_write(request.addr, request.data, function(response) {
                clientCallback(response);
            });
        });

    });

};