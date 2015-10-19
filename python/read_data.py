#!/usr/bin/env python

import sys, struct, time

####################################################

print "Dumping the VFAT2 registers to disk"

f = open(sys.argv[1], "rb")

while (True):
    packet0 = struct.unpack(">I", f.read(4))[0]
    packet1 = struct.unpack(">I", f.read(4))[0]
    packet2 = struct.unpack(">I", f.read(4))[0]
    packet3 = struct.unpack(">I", f.read(4))[0]
    packet4 = struct.unpack(">I", f.read(4))[0]
    packet5 = struct.unpack(">I", f.read(4))[0]
    packet6 = struct.unpack(">I", f.read(4))[0]

    bc = (0x0fff0000 & packet0) >> 16;
    ec = (0x00000ff0 & packet0) >> 4;
    flags = packet0 & 0xf;
    chipID = (0x0fff0000 & packet1) >> 16;
    strips0 = ((0x0000ffff & packet1) << 16) | ((0xffff0000 & packet2) >> 16);
    strips1 = ((0x0000ffff & packet2) << 16) | ((0xffff0000 & packet3) >> 16);
    strips2 = ((0x0000ffff & packet3) << 16) | ((0xffff0000 & packet4) >> 16);
    strips3 = ((0x0000ffff & packet4) << 16) | ((0xffff0000 & packet5) >> 16);
    crc = 0x0000ffff & packet5;

    print ec

f.close()