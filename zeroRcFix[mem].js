/// <reference path=".config/sa.d.ts" />

import {Button} from ".config/sa.enums.mts";

const BTN_UP = Button.DpadUp;
const BTN_DOWN = Button.DpadDown;
const SPEED = 0.04;

const player = new Player(0);

function findGoblin() {
    const cam = Memory.Read(0xB6F028 + 0x14, 4, false); // TheCamera.m_pMatrix
    if (!cam) return 0;
    const x = Memory.ReadFloat(cam + 0x30, false);
    const y = Memory.ReadFloat(cam + 0x34, false);
    const z = Memory.ReadFloat(cam + 0x38, false);
    const pool = Memory.Read(0xB74494, 4, false);
    const objects = Memory.Read(pool, 4, false);
    const map = Memory.Read(pool + 4, 4, false);
    const count = Memory.Read(pool + 8, 4, false);
    let best = 0, bestDist = 1e12;
    for (let i = 0; i < count; i++) {
        if (Memory.Read(map + i, 1, false) & 0x80) continue;
        const v = objects + i * 0xA18;
        if (Memory.Read(v + 0x22, 2, false) !== 501) continue;
        const m = Memory.Read(v + 0x14, 4, false);
        if (!m) continue;
        const px = Memory.ReadFloat(m + 0x30, false);
        const py = Memory.ReadFloat(m + 0x34, false);
        const pz = Memory.ReadFloat(m + 0x38, false);
        const d = (px - x) ** 2 + (py - y) ** 2 + (pz - z) ** 2;
        if (d < bestDist) { bestDist = d; best = v; }
    }
    return best;
}

while (true) {
    wait(0);
    if (!player.isPlaying()) continue;

    const up = Pad.IsButtonPressed(0, BTN_UP);
    const down = Pad.IsButtonPressed(0, BTN_DOWN);
    if (up === down) continue;

    try {
        const heli = findGoblin();
        if (heli) Memory.WriteFloat(heli + 0x4C, up ? SPEED : -SPEED, false);
    } catch (e) {
        log("heli_altitude error: " + e);
        wait(1000);
    }
}
