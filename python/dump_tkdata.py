#!/usr/bin/env python

import sys, os, random, time, struct
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/kernel")
from ipbus import *

####################################################

print "Dumping the VFAT2 registers to disk"

glib = GLIB()

filename = time.strftime("tkdata_%Y_%m_%d_%H_%M_%S.txt", time.gmtime())
f = open(filename, "wb", 0)

while (True):
    depth = glib.get("tk_data_cnt")
    if (depth > 0):
        data = glib.fifoRead("tk_data_rd", depth)
        for d in data: f.write(struct.pack(">I", d))

f.close()