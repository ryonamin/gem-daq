#!/usr/bin/env python

import sys, os, random, time
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/kernel")
from ipbus import *
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

glib = GLIB()

N_EVENTS = 100.
VCAL_MIN = 10
VCAL_MAX = 200
THRESHOLD_MIN = 0
THRESHOLD_MAX = 50

glib.set("oh_clk_source", 0)
glib.set("oh_trigger_source", 1)

glib.set("vfat2_0_ctrl0", 55)
glib.set("vfat2_0_ctrl1", 0)
glib.set("vfat2_0_ctrl2", 48)
glib.set("vfat2_0_ctrl3", 0)
glib.set("vfat2_0_ipreampin", 168)
glib.set("vfat2_0_ipreampfeed", 80)
glib.set("vfat2_0_ipreampout", 150)
glib.set("vfat2_0_ishaper", 150)
glib.set("vfat2_0_ishaperfeed", 150)
glib.set("vfat2_0_icomp", 75)
glib.set("vfat2_0_vthreshold2", 0)

glib.set("vfat2_0_latency", 36)
glib.set("vfat2_0_channel14", 64)

glib.set("t1_reset", 1)
glib.set("t1_mode", 1)
glib.set("t1_n", 0)
glib.set("t1_interval", 2000)
glib.set("t1_delay", 40)
glib.set("t1_toggle", 1)

matrix = []
xs = []
ys = []
zs = []

for threshold in range(THRESHOLD_MIN, THRESHOLD_MAX):
    glib.set("vfat2_0_vthreshold1", threshold)

    xValues = []
    yValues = []

    glib.set('scan_reset', 1)
    glib.set('scan_mode', 3)
    glib.set('scan_channel', 14)
    glib.set('scan_vfat2', 0)
    glib.set('scan_min', VCAL_MIN)
    glib.set('scan_max', VCAL_MAX)
    glib.set('scan_step', 1)
    glib.set('scan_n', int(N_EVENTS))
    glib.set('scan_toggle', 1)
    while (glib.get("scan_status") != 0): i = 1
    data = glib.fifoRead('scan_data', VCAL_MAX - VCAL_MIN - 1)
    for d in data:
        xValues.append((d & 0xff000000) >> 24)
        yValues.append((d & 0xffffff) / N_EVENTS)
        xs.append((d & 0xff000000) >> 24)
        ys.append(threshold)
        zs.append((d & 0xffffff) / N_EVENTS)

    matrix.append(yValues)

    print threshold

glib.set("vfat2_0_ctrl0", 0)

array = np.array(matrix)
array.transpose()

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.scatter(xs, ys, zs)
#plt.matshow(array)
plt.show()