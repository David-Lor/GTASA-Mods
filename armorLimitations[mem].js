/// <reference path=".config/sa.d.ts" />
/// <reference path=".config/enums.ts" />

import {KeyCode} from ".config/sa.enums.mts";

const DEVMODE = false;

const player = new Player(0);
const playerChar = player.getChar();

let lastArmorStatus = false;

// noinspection InfiniteLoopJS
while (true) {
    if (DEVMODE && Pad.IsKeyUp(KeyCode.N)) {
        playerChar.addArmor(200);
    }
    else if (DEVMODE && Pad.IsKeyUp(KeyCode.M)) {
        try {
            playerChar.addArmor(-200);
        } catch (e) {}
    }

    wait(1000);

    // Dead or arrested: skip
    if (!player.isPlaying() || player.isDead()) {
        wait(5000);
        continue;
    }

    const armorStatus = playerChar.getArmor() > 0;
    if (!armorStatus && lastArmorStatus) {
        // Armor removed
        player.disableSprint(false);
        showTextBox("Your body armor has been removed. You can run again.");
    } else if (!lastArmorStatus && armorStatus) {
        // Armor added
        player.disableSprint(true);
        showTextBox("You cannot run with body armor on.");
    } else if (armorStatus) {
        // Armor remains
        player.disableSprint(true);
    }
}
