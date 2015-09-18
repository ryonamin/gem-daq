function addr_link(addr, link) { return addr + (link << 8); }

function vfat2_reg(vfat2, reg) { return 0x40000000 + ((vfat2 & 0xff) << 8) + (reg & 0xff); }

function ei2c_reg(reg) { return 0x41000000 + (reg & 0xff); }
