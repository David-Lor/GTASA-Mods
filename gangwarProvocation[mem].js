// With this level, shooting a single enemy gang member triggers the gang war.
const LEVEL = 19.099999;

while (true) {
    wait(3000);
    Memory.Write(0x859974, 4, 19.099999, false);
}
