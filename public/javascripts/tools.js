function addr_link(addr, link) { return addr + (link << 8); }

function vfat2_reg(vfat2, reg) { return 0x40010000 + (vfat2 << 8) + reg; }
