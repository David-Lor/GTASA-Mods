/// <reference path=".config/sa.d.ts" />

const COST = 500;

const schoolMissions = [
  "dskool", // driving school
  "bskool", // bike school
  "boat",   // boat school
  "desert5" // fly school
];

const ACTIVE_SCRIPTS = 0xA8B42C; // CTheScripts::pActiveScripts
const OFF_NEXT = 0x00;           // CRunningScript::m_pNext
const OFF_NAME = 0x08;           // CRunningScript::m_szName[8]
const OFF_MISSION = 0xCE;        // CRunningScript::m_bUseMissionCleanup

function readName(script) {
  let name = "";
  for (let i = 0; i < 8; i++) {
    const c = Memory.ReadU8(script + OFF_NAME + i);
    if (c === 0) break;
    name += String.fromCharCode(c);
  }
  return name.toLowerCase();
}

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

const player = new Player(0);
let prevAutoescuela = false;

// noinspection InfiniteLoopJS
while (true) {
  wait(1000);
  if (!player.isPlaying()) continue;

  const nowAutoescuela = schoolMissions.indexOf(getMissionName()) >= 0 && player.getChar().isSittingInAnyCar();
  if (nowAutoescuela !== prevAutoescuela) {
    if (!nowAutoescuela) {
      // Cobrar
      Text.PrintStringNow(`Charged ${COST} for the driving session`, 3000);
      player.addScore(-COST);
    }

    prevAutoescuela = nowAutoescuela;
  }
}
