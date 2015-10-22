#!/usr/bin/env python

import sys, os, time, struct, signal
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/kernel")
from ipbus import *

####################################################

def signal_handler(signal, frame):
        print('You pressed Ctrl+C!')
        sys.exit(0)

####################################################

print "Dumping the VFAT2 registers to disk"

glib = GLIB()

filename0 = time.strftime("../data/tkdata/tkdata_%Y_%m_%d_%H_%M_%S-OH0.txt", time.gmtime())
filename1 = time.strftime("../data/tkdata/tkdata_%Y_%m_%d_%H_%M_%S-OH1.txt", time.gmtime())
f0 = open(filename0, "wb", 0)
f1 = open(filename1, "wb", 0)

signal.signal(signal.SIGINT, signal_handler)

while (True):
    depth = glib.get("tk_data_cnt")
    if (depth > 0):
        fmt = ">" + "I" * depth
        raw_data = glib.fifoRead("tk_data_rd", depth)
        str_data = struct.pack(fmt, *raw_data)
        for d in str_data: f0.write(d)
    depth = glib.get("tk_data_cnt_1")
    if (depth > 0):
        fmt = ">" + "I" * depth
        raw_data = glib.fifoRead("tk_data_rd_1", depth)
        str_data = struct.pack(fmt, *raw_data)
        for d in str_data: f1.write(d)


f0.close()
f1.close()