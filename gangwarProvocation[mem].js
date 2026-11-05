// With this level, shooting a single enemy gang member triggers the gang war.
const LEVEL = 19.099999;
const DELAY = 3000;

// noinspection InfiniteLoopJS
while (true) {
    wait(DELAY);
    Memory.Write(0x859974, 4, LEVEL, false);
}
