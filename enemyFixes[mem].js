/// <reference path=".config/sa.d.ts" />

const ENEMY_ACCURACY = 1;  // 0~100, -1=no mod. Lower=worse accuracy.
const ENEMY_MAX_HEALTH = 200;  // 0=no mod
const ENEMY_MAX_ARMOR = 200;  // 0=no mod
const ENEMY_DAMAGEABLE_BY_NPCS = true;  // true=allow NPCs to be killed by any other NPC (by default some NPCs are only killable by the player)

const SCAN_RADIUS = 300.0;
const SCAN_INTERVAL = 250;
const SAFETY = 128;
const DEBUG_TARGETING_NPCS = false;

// Peds excluded from these modifications
const EXCLUDE_PEDS = [
    269, // smoke (not final mission)
    270, // sweet
    271, // ryder
    290, // rosenberg
    292, // cesar
    293, // og loc
    294, // woozie
    295, // torino
    1,   // truth
];

const player = new Player(0);
const playerChar = player.getChar();

function loop() {
    const pos = playerChar.getCoordinates();
    let findNext = false;

    let processedPeds = [];

    for (let i = 0; i < SAFETY; i++) {
        const ped = World.GetRandomCharInSphereNoSaveRecursive(
            pos.x, pos.y, pos.z, SCAN_RADIUS, findNext, 0
        );
        if (!ped) break;

        findNext = true;
        if (ped === playerChar || EXCLUDE_PEDS.includes(ped.getModel())) continue;

        processedPeds.push(ped);

        // Limit accuracy
        if (ENEMY_ACCURACY >= 0) {
            ped.setAccuracy(ENEMY_ACCURACY);
        }

        // Limit health
        if (ENEMY_MAX_HEALTH > 0) {
            if (ped.getMaxHealth() > ENEMY_MAX_HEALTH) {
                ped.setMaxHealth(ENEMY_MAX_HEALTH);
            }
            if (ped.getHealth() > ENEMY_MAX_HEALTH) {
                ped.setHealth(ENEMY_MAX_HEALTH);
            }
        }

        // Limit armor
        if (ENEMY_MAX_ARMOR > 0) {
            let armor = ped.getArmor();
            if (armor > ENEMY_MAX_ARMOR) {
                armor = ENEMY_MAX_ARMOR - armor;
                ped.addArmor(armor);
            }
        }

        if (ENEMY_DAMAGEABLE_BY_NPCS) {
            ped.setOnlyDamagedByPlayer(false);
        }
    }

    if (DEBUG_TARGETING_NPCS) {
        const target = player.getCharIsTargeting();
        if (target) {
            const model = target.getModel().toString();
            const health = target.getHealth();
            const armor = target.getArmor();
            Text.PrintStringNow(`Aim: ${model} health=${health} armor=${armor} processed=${processedPeds.includes(target)} pedsCount=${processedPeds.length}`, 3000);
        }
    }
}

let lastErr = undefined;

while (true) {
    wait(SCAN_INTERVAL);

    try {
        loop();

    } catch (err) {
        if (err !== lastErr) {
            log(`ERROR: ${err}`);
            lastErr = err;
        }
    }

}
