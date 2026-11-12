/// <reference path=".config/sa.d.ts" />

import {WeaponType} from ".config/sa.enums.mts";

const player = new Player(0);
const playerChar = player.getChar();

function isInAnyVehicle() {
    return playerChar.isInAnyCar() ||
        playerChar.isInAnyBoat() ||
        playerChar.isInAnyPlane() ||
        playerChar.isInAnyHeli() ||
        playerChar.isInAnyTrain();
}

function isUnarmed() {
    const currentWeapon = playerChar.getCurrentWeapon();
    return currentWeapon === WeaponType.Unarmed || currentWeapon === WeaponType.BrassKnuckles;
}

let lastInVehicle = false;

// noinspection InfiniteLoopJS
while (true) {
    wait(100);

    const inVehicle = isInAnyVehicle();
    if (inVehicle !== lastInVehicle) {
        if (!inVehicle && !isUnarmed()) {
            playerChar.setCurrentWeapon(WeaponType.Unarmed);
            showTextBox("Exit vehicle: unarmed");
        }
        lastInVehicle = inVehicle;
    }
}
