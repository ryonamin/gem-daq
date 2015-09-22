function addr_link(addr, link) { return addr + (link << 8); }

function vfat2_reg(vfat2, reg) { return 0x40000000 + ((vfat2 & 0xff) << 8) + (reg & 0xff); }

function ei2c_reg(reg) { return 0x41000000 + (reg & 0xff); }

function counter_reg(reg) { return 0x4A000000 + (reg & 0xff); }

function popcount(n) {
    n >>>= 0;
    for(var popcnt = 0; n; n &= n - 1) popcnt++;
    return popcnt;
}
