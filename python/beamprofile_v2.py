import sys, os, struct, math
import matplotlib.pyplot as plt

def stripMapping(vfat2Strips):
    # Mapping
    stripsToConnector = [ 64, 65, 63, 66, 62, 67, 61, 68, 60, 69, 59, 70, 58, 71, 57, 72, 56, 73, 55, 74, 54, 75, 53, 76, 52, 77, 51, 78, 50, 79, 49, 80, 48, 81, 47, 82, 46, 83, 45, 84, 44, 85, 43, 86, 42, 87, 41, 88, 40, 89, 39, 90, 38, 91, 37, 92, 36, 93, 35, 94, 34, 95, 33, 96, 32, 97, 31, 98, 30, 99, 29, 100, 28, 101, 27, 102, 26, 103, 25, 104, 24, 105, 23, 106, 22, 107, 21, 108, 20, 109, 19, 110, 18, 111, 17, 112, 16, 113, 15, 114, 14, 115, 13, 116, 12, 117, 11, 118, 10, 119, 9, 120, 8, 121, 7, 122, 6, 123, 5, 124, 4, 125, 3, 126, 2, 127, 1, 128 ]
    # Strip are from 127 down to 0 so we have to reverse them
    correctOrder = vfat2Strips[::-1]
    # Strip 127 is connected to position 0 on the connector
    gemStrips = ['0'] * 128
    # Loop on the Strips
    for strip in range(0, 128):
        vfat2 = stripsToConnector[strip] - 1
        gemStrips[vfat2] = correctOrder[strip]
    return gemStrips

###################################################

print "Starting a beam profile analysis..."

if (len(sys.argv) < 2):
    print "You need to provide a file path as input parameter!"
    sys.exit(0)

if (os.path.isfile(sys.argv[1]) == False):
    print "File doesn't exist!"
    sys.exit(0)

f = open(sys.argv[1], "rb")
print "File opened: "+sys.argv[1]

###################################################

# Skip headers

events = 0
stripsplot = [0] * 128
stripshist = []

while (True):
    # Alignment
    c = f.read(4)
    if not c: break
    # Get data
    packet6 = struct.unpack(">I", c)[0]
    packet5 = struct.unpack(">I", f.read(4))[0]
    packet4 = struct.unpack(">I", f.read(4))[0]
    packet3 = struct.unpack(">I", f.read(4))[0]
    packet2 = struct.unpack(">I", f.read(4))[0]
    packet1 = struct.unpack(">I", f.read(4))[0]
    packet7 = struct.unpack(">I", f.read(4))[0]
    f.read(1)

    # Format data
    chipid = str((0x0fff0000 & packet5) >> 16)
    strips = bin(((0x0000ffff & packet5) << 16) | ((0xffff0000 & packet4) >> 16))[2:].zfill(32) + bin(((0x0000ffff & packet4) << 16) | ((0xffff0000 & packet3) >> 16))[2:].zfill(32) + bin(((0x0000ffff & packet3) << 16) | ((0xffff0000 & packet2) >> 16))[2:].zfill(32) + bin(((0x0000ffff & packet2) << 16) | ((0xffff0000 & packet1) >> 16))[2:].zfill(32)

    # Ignore empty events
    if (strips == ('0' * 128)):
        stripsplot[0] += 1
        stripshist.append(0)
        continue

    events += 1

    # Fill beam profile
    gemStrips = stripMapping(strips)
    for i in range(0, 128):
        if (gemStrips[i] == '1'):
            stripsplot[i] += 1
            stripshist.append(i)

print "Number of events", events


if events != 0:
    # plt.plot(stripsplot)
    # plt.axis([0, 128, 0, max(stripsplot)])
    plt.hist(stripshist, bins = 128)
    plt.xlim(0, 128)
    plt.xlabel("Strips")
    plt.ylabel("Number of hits")
    plt.show()
else:
    print "Empty file"
