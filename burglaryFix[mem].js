/// <reference path=".config/sa.d.ts" />


const MISSION_NAME = "burgjb";
const ACTIVE_SCRIPTS = 0xA8B42C; // CTheScripts::pActiveScripts (cabeza de la lista)
const OFF_NEXT = 0x00;           // CRunningScript::m_pNext
const OFF_NAME = 0x08;           // CRunningScript::m_szName[8]
const OFF_MISSION = 0xCE;        // CRunningScript::m_bUseMissionCleanup

const HOUSE_INTERIORS = [
    // src: https://gtamods.com/wiki/Interior
    "LAHS1B",
    "LAHS1A",
    "VGHSB1",
    "VGHSB3",
    "LAHSB4",
    "LAHS2A",
    "LAHSS6",
    "SFHSM2",
    "LAHSB3",
    "SFHSB1",
    "VGHSM2",
    "LAHSB1",
    "SFHSB2",
    "SFHSS2",
    "LAHSB2",
    "SFHSS1",
    "LAHS2B",
    "SFHSB3",
    "VGHSM3",
    "SFHSM1",
    "VGHSS1",
    "VGSHM2",
    "VGSHM3",
    "VGSHS2"
];

function getMissionName() {
    let script = Memory.ReadU32(ACTIVE_SCRIPTS);
    while (script !== 0) {
        if (Memory.ReadU8(script + OFF_MISSION) !== 0) {
            return readName(script);
        }
        script = Memory.ReadU32(script + OFF_NEXT);
    }
    return null;
}

function readName(script) {
    let name = "";
    for (let i = 0; i < 8; i++) {
        const c = Memory.ReadU8(script + OFF_NAME + i);
        if (c === 0) break;
        name += String.fromCharCode(c);
    }
    return name.toLowerCase();
}

// noinspection InfiniteLoopJS
while (true) {
    wait(1000);

    if (getMissionName() === MISSION_NAME) {
        Game.EnableBurglaryHouses(true);
        HOUSE_INTERIORS.forEach(interior => World.SwitchEntryExit(interior, true));
    }
}
