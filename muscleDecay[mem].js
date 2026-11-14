/// <reference path=".config/sa.d.ts" />

const DECAY_MUSCLE = 10;  // muscle lost for each evaluation (range 0-1000)
const DECAY_DELAY_HOURS = 12;  // in-game hours between evaluations
const DECAY_DELAY_HOURS_AFTER_GAINING = 24;  // in-game hours of grace after gaining muscle

const MUSCLE_STAT_ADDR = 0xB793DC;   // CStats::StatTypesFloat[23] (STAT_MUSCLE)
const CLOCK_MINUTES_ADDR = 0xB70152; // CClock::ms_nGameClockMinutes
const CLOCK_HOURS_ADDR = 0xB70153;   // CClock::ms_nGameClockHours
const MUSCLE_MIN = 0.0;

function getMuscle() {
    return Memory.ReadFloat(MUSCLE_STAT_ADDR, false);
}
function setMuscle(value) {
    Memory.WriteFloat(MUSCLE_STAT_ADDR, value, false);
}
function getGameMinuteOfDay() {
    const h = Memory.Read(CLOCK_HOURS_ADDR, 1, false);
    const m = Memory.Read(CLOCK_MINUTES_ADDR, 1, false);
    return h * 60 + m;
}

const player = new Player(0);
let lastMinute = getGameMinuteOfDay();
let minutesElapsed = 0;
let currentDelayMin = DECAY_DELAY_HOURS * 60;
let lastKnownMuscle = getMuscle();

while (true) {
    wait(500);

    if (!player.isPlaying()) continue;

    const nowMinute = getGameMinuteOfDay();
    let delta = nowMinute - lastMinute;
    if (delta < 0) delta += 1440;
    lastMinute = nowMinute;
    minutesElapsed += delta;

    const muscle = getMuscle();
    if (muscle > lastKnownMuscle + 0.001) {
        minutesElapsed = 0;
        currentDelayMin = DECAY_DELAY_HOURS_AFTER_GAINING * 60;
        lastKnownMuscle = muscle;
        continue;
    }
    lastKnownMuscle = muscle;

    if (minutesElapsed >= currentDelayMin) {
        minutesElapsed -= currentDelayMin;
        currentDelayMin = DECAY_DELAY_HOURS * 60;

        if (muscle > MUSCLE_MIN) {
            const newMuscle = Math.max(MUSCLE_MIN, muscle - DECAY_MUSCLE);
            setMuscle(newMuscle);
            lastKnownMuscle = newMuscle;

            player.buildModel();
        }
    }
}
