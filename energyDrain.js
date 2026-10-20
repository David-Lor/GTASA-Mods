/// <reference path=".config/sa.d.ts" />

const MAX_HP = 100;  // Base player health
const DAY_MINUTES = 24 * 60;  // 1440 in-game minutes
const DRAIN_PER_MIN = MAX_HP / DAY_MINUTES;  // ≈ 0.0694 HP per game minute
const HEAL_ON_SLEEP = true;  // keep the "heal when saving/sleeping" behavior. Do not drain energy when time passes quickly (e.g., sleeping, cutscenes, hospital, arrested...)
const SLEEP_MIN_SKIP = 60;  // in-game minutes skipped to consider it a sleep
const JUMP_THRESHOLD = 3;
const COOLDOWN_FRAMES = 120;


const player = new Player(0);
const playerChar = player.getChar();

function gameMinutes() {
    const t = Clock.GetTimeOfDay();
    return t.hours * 60 + t.minutes;
}

let lastMinutes = gameMinutes();
let acc = 0;
let cooldown = 0;
let skippedTotal = 0;

while (true) {
    wait(0);

    const current = gameMinutes();

    if (!player.isPlaying() || player.isDead()) {
        lastMinutes = current;
        continue;
    }

    let delta = current - lastMinutes;
    if (delta < 0) delta += DAY_MINUTES;  // wrap around midnight
    lastMinutes = current;

    if (delta > JUMP_THRESHOLD) {
        cooldown = COOLDOWN_FRAMES;
        skippedTotal += delta;
        acc = 0;
        continue;
    }

    if (cooldown > 0) {
        cooldown--;
        if (cooldown === 0) {
            if (HEAL_ON_SLEEP && skippedTotal >= SLEEP_MIN_SKIP) {
                playerChar.setHealth(MAX_HP);
            }
            skippedTotal = 0;
        }
        continue;
    }

    if (delta === 0) continue;

    acc += delta * DRAIN_PER_MIN;
    const whole = Math.floor(acc);

    if (whole >= 1) {
        acc -= whole;
        const hp = playerChar.getHealth();
        playerChar.setHealth(Math.max(0, hp - whole));
    }
}
