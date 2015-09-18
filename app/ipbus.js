var dgram = require('dgram');
var udp = dgram.createSocket({ type: 'udp4', reuseAddr : true });

var ipaddr = "192.168.0.161";
var port = 50001;

var packets = new Array();
var packetId = 0;
var packet = undefined;


udp.bind();

/*
 * Send transactions
 */

setInterval(function() {
    if (packet === undefined && packets.length > 0) {
        packet = packets.shift();
        udp.send(packet.data, 0, packet.data.length, port, ipaddr); 
    }
}, 1);  

/*
 * Receive transactions
 */

udp.on('message', function(message) {
    // Response
    var data = {
        ipbusVersion: (message[0] >> 4),
        packetId: ((message[4] & 0xf) << 8) | message[5],
        packetType: (message[7] & 0xf0) >> 4,
        infoCode: (message[3] & 0x0f),
        data: null
    };
    // Read
    if (data.packetType == 0) data.data = (message[8] << 24) | (message[9] << 16) | (message[10] << 8) | message[11];
    // Write
    else if (data.packetType == 1) data.data = 0;

    // Callback
    if (packet !== undefined) {
        (packet.callback)(data);
        packet = undefined;
    }
    else console.log('UDP: received packet', data.packetId, 'but NO callback :(');
});

/*
 * Handle timeouts
 */

setInterval(function() {
    if (packet !== undefined) {
        if (packet.timeout > 0) --packet.timeout;
        else {
            (packet.callback)({
                ipbusVersion: 0x2,
                packetId: packet.id,
                packetType: null,
                infoCode: 0x6,
                data: null
            });
            console.log('Timeout: transaction', packet.id, 'timed out :(');
            packet = undefined;
        }
    }
}, 10);  

/*
 * IPBus read transaction in queue
 */

function ipbus_read(addr, callback) {
    packets.push({
        id: packetId++,
        data: new Buffer([
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
        ]),
        callback: callback,
        timeout: 100
    });     
};

/*
 * IPBus write transaction in queue
 */

function ipbus_write(addr, data, callback) {
    packets.push({
        id: packetId++,
        data: new Buffer([
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
            ((data & 0xff000000) >> 24),
            ((data & 0x00ff0000) >> 16),
            ((data & 0x0000ff00) >> 8),
            (data & 0x000000ff)
        ]),
        callback: callback,
        timeout: 100
    });      
};

/*
 * Socket IO interface
 */

module.exports = function(io) {

    io.on('connection', function (socket) {

        // IPBus read
        socket.on('ipbus_read', function(request, callback) {
            ipbus_read(request.addr, callback);
        });

        // IPBus write
        socket.on('ipbus_write', function(request, callback) {
            ipbus_write(request.addr, request.data, callback);
        });

    });

};