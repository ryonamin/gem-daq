var fs = require('fs');

var dgram = require('dgram');
var udp = dgram.createSocket('udp4');

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

        socket.on('save', function(transaction, callback) {
            var now = require('moment')();
            var fileName = "../data/" + transaction.type + "/" + now.format('YY-MM-DD-HH-mm-ss') + ".txt";
            var content = "";

            if (transaction.type == "threshold" || transaction.type == "latency") {
                content += "VFAT2\t" + transaction.vfat2 + "\n";
                content += "MIN\t" + transaction.min + "\n";
                content += "MAX\t" + transaction.max + "\n";
                content += "STEP\t" + transaction.step + "\n";
                content += "N\t" + transaction.n + "\n";
                for (var i = 0; i < transaction.data.length; ++i) content += transaction.data[i] + "\n";
            }
            else if (transaction.type == "vfat2") {
                for (var i = 0; i < transaction.data.length; ++i) {
                    content += "--------------------" + transaction.data[i].id + "--------------------\n";
                    content += "isPresent\t" + (transaction.data[i].isPresent ? "1" : "0") + "\n";
                    content += "isOn\t" + (transaction.data[i].isOn ? "1" : "0") + "\n";
                    content += "ctrl0\t" + transaction.data[i].ctrl0 + "\n";
                    content += "ctrl1\t" + transaction.data[i].ctrl1 + "\n";
                    content += "ctrl2\t" + transaction.data[i].ctrl2 + "\n";
                    content += "ctrl3\t" + transaction.data[i].ctrl3 + "\n";
                    content += "iPreampIn\t" + transaction.data[i].iPreampIn + "\n";
                    content += "iPremapFeed\t" + transaction.data[i].iPremapFeed + "\n";
                    content += "iPreampOut\t" + transaction.data[i].iPreampOut + "\n";
                    content += "iShaper\t" + transaction.data[i].iShaper + "\n";
                    content += "iShaperFeed\t" + transaction.data[i].iShaperFeed + "\n";
                    content += "iComp\t" + transaction.data[i].iComp + "\n";
                    content += "chipId0\t" + transaction.data[i].chipId0 + "\n";
                    content += "chipId1\t" + transaction.data[i].chipId1 + "\n";
                    content += "latency\t" + transaction.data[i].latency + "\n";
                    content += "vthreshold1\t" + transaction.data[i].vthreshold1 + "\n";
                    content += "vthreshold2\t" + transaction.data[i].vthreshold2 + "\n";
                    content += "vcal\t" + transaction.data[i].vcal + "\n";
                    content += "calphase\t" + transaction.data[i].calphase + "\n";
                }
            }

            fs.writeFile(fileName, content, callback);
        });

    });
};