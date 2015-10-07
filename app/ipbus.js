var dgram = require('dgram');
var udp = dgram.createSocket({ type: 'udp4', reuseAddr : true });

var ipaddr = "192.168.0.161";
var port = 50001;

var packets = new Array();
var packet = undefined;
var packetId = 0;


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
    var response = {
        ipbusVersion: (message[0] >> 4),
        id: ((message[4] & 0xf) << 8) | message[5],
        size: message[6],
        type: (message[7] & 0xf0) >> 4,
        infoCode: message[7] & 0xf,
        data: [ ]
    };
    // Read
    if (response.type == 0 || response.type == 2) {
        if (response.size == 1) response.data = (message[8] << 24) | (message[9] << 16) | (message[10] << 8) | message[11];
        else {
            for (var i = 0; i < response.size; ++i) response.data.push((message[8 + i * 4] << 24) | (message[9 + i * 4] << 16) | (message[10 + i * 4] << 8) | message[11 + i * 4]);
        }
    }
    // Write
    else if (response.type == 1) response.data = 0;

    // Callback
    if (packet !== undefined) {
        (packet.callback)(response);
        packet = undefined;
    }
    else console.log('UDP: received packet', response.id, 'but NO callback :(');
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
                id: packet.id,
                type: null,
                infoCode: 0x6,
                data: null
            });
            console.log('Timeout: transaction', packet.id, 'timed out :(');
            packet = undefined;
        }
    }
}, 10);  

/*
 * Socket IO interface
 */

module.exports = function(io) {

    io.on('connection', function (socket) {

        socket.on('ipbus', function(transaction, callback) {
            var udp_data = [
                // Transaction Header
                0x20, // Protocol version & RSVD
                0x0, // Transaction ID (0 or bug)
                0x0, // Transaction ID (0 or bug)
                0xf0, // Packet order & type
                // Packet Header
                (0x20 | ((packetId & 0xf00) >> 8)), // Protocol version & Packet ID MSB
                (packetId & 0xff), // Packet ID LSB,
                transaction.size, // Words
                (((transaction.type & 0xf) << 4) | 0xf), // Type & Info code
                // Address
                ((transaction.addr & 0xff000000) >> 24),
                ((transaction.addr & 0x00ff0000) >> 16),
                ((transaction.addr & 0x0000ff00) >> 8),
                (transaction.addr & 0x000000ff)
            ];
            if (transaction.type == 1 || transaction.type == 3) {
                for (var i = 0; i < transaction.size; ++i) {
                    udp_data.push((transaction.data[i] & 0xff000000) >> 24);
                    udp_data.push((transaction.data[i] & 0x00ff0000) >> 16);
                    udp_data.push((transaction.data[i] & 0x0000ff00) >> 8);
                    udp_data.push(transaction.data[i] & 0x000000ff);
                }
            }
            packets.push({
                id: packetId++,
                data: new Buffer(udp_data),
                callback: callback,
                timeout: 100
            });
        }); 

    });
};