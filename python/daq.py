#!/usr/bin/env python

import sys, os, time, struct, signal
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/sys/kernel")
from ipbus import *

glib = GLIB()

####################################################

def signal_handler(signal, frame):
    sys.exit(0)

####################################################

print 
print "Welcome to the Python DAQ scripts"
print

while(True):
    print "Select what you want to do:" 
    print "0: save the VFAT2 parameters to disk"
    print "1: acquire tracking data"
    print "2: acquire AND monitor tracking data (slower than above option)"
    option = raw_input("> Select an option:")
    if (option == "0" or option == "1" or option == "2"): break
    print "You entered an invalid option"
    print

if (option == "0"): SaveVFAT2()
elif (option == "1"): AcquireData()


####################################################

def SaveVFAT2():
    print "Dumping the VFAT2 registers to disk"
    filename = time.strftime("../data/vfat2/vfat2_%Y_%m_%d_%H_%M_%S.txt", time.gmtime())
    f = open(filename, "w")
    for i in range(0, 24):
        values = glib.blockRead("vfat2_" + str(i) + "_ctrl0", 0x96)
        f.write(str(i) + "\t")
        for val in values: f.write(str(val & 0xff) + "\t")
        f.write("\n")
    f.close()    

####################################################

def AcquireData():
    print "Acquiring data"
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