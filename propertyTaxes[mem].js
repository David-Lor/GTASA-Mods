/// <reference path=".config/sa.d.ts" />

const PROPERTY_TAX_MULTIPLIER = 0.01;
const TAX_JITTER_MULTIPLIER = 1.25;
const DELAY = 5000;
const DEV_MODE = true;

const STAT_FLOATS = 0xB79380;       // CStats::StatTypesFloat (1.0 US), verify
const STAT_PROPERTY_BUDGET = 15;    // float stats are indexed by their ID

function getPropertyBudget() {
    return Memory.ReadFloat(STAT_FLOATS + STAT_PROPERTY_BUDGET * 4, false);
}

function getTaxation() {
    const budget = getPropertyBudget();
    let tax = budget * PROPERTY_TAX_MULTIPLIER;
    tax = jitter(tax, TAX_JITTER_MULTIPLIER);
    return Math.round(tax);
}

function doTax() {
    const tax = getTaxation();
    const player = new Player(0);
    player.addScore(tax * -1);
    showTextBox(`This week taxes: ${tax}`);
}

function jitter(value, jitterMultiplier) {
    const spread = Math.abs(jitterMultiplier - 1);
    if (spread === 0) {
        return value;
    }
    return value + (Math.random() * 2 - 1) * value * spread;
}

let lastWeekDay = -1;

// noinspection InfiniteLoopJS
while (true) {
    wait(DEV_MODE ? 0 : DELAY);
    if (DEV_MODE && Pad.TestCheat("TAX")) {
        doTax();
    }

    const weekDay = Clock.GetCurrentDayOfWeek();
    if (lastWeekDay === 1 && weekDay === 2) {
        wait(DELAY);
        doTax();
    }
    lastWeekDay = weekDay;
}
