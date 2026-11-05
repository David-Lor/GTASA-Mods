/// <reference path="./.config/sa.d.ts" />

import {Button, CarLock, PadId} from ".config/sa.enums.mts";

const SEARCH_RADIUS = 5.0;
const ENTER_GAMEPAD_BUTTONS: Button[] = [
    Button.Cross,    // A
    Button.DpadRight,
];
const TRUCK_MODELS = [403, 514, 515];

const player = new Player(0);
const playerChar = player.getChar();
const padButtonsStatus = new Map<Button[], boolean>();

function padButtonsPressed(buttons: Button[]) {
    let currentStatus = true;
    for (const button of buttons) {
        if (!Pad.IsButtonPressed(PadId.Pad1, button)) {
            currentStatus = false;
            break;
        }
    }

    const lastStatus = padButtonsStatus.get(buttons) || false;
    if (lastStatus !== currentStatus) {
        padButtonsStatus.set(buttons, currentStatus);
        return currentStatus;
    }

    return false;
}

function unlockTruck(truck: Car) {
    // Unlock the doors
    truck.lockDoors(CarLock.Unlocked);

    // Detach trailer
    new Trailer(-1).detachFromCab(truck);
}

function unlockNearestTruck() {
    const pos = playerChar.getCoordinates();
    let truck: Car = undefined;
    for (let i = 0; i < 10; i++) {
        const carObj = World.GetRandomCarInSphereNoSaveRecursive(
            pos.x, pos.y, pos.z,
            SEARCH_RADIUS,
            false,
            true
        );

        if (carObj && TRUCK_MODELS.includes(carObj.getModel())) {
            truck = carObj;
            break;
        }
    }

    if (truck !== undefined) {
        unlockTruck(truck);
    } else {
        showTextBox("No truck nearby");
    }
}

// noinspection InfiniteLoopJS
while (true) {
    wait(10);
    if (padButtonsPressed(ENTER_GAMEPAD_BUTTONS)) {
        unlockNearestTruck();
    }
}
