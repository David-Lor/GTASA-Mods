/// <reference path=".config/sa.d.ts" />
import {Button, PadId, PickupType, WeaponType} from ".config/sa.enums.mts";

const KEY_DROP_GAMEPAD_BUTTONS: Button[] = [
    Button.LeftShoulder1,
    Button.RightShoulder1,
    Button.DpadDown
];

const DISTANCE_TO_PICKUP: float = 2.5;
const ARMOR_LIMIT = 80;

const padButtonsStatus = new Map<Button[], boolean>();
const player = new Player(0);
const playerChar = player.getChar();


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

function getDropLocation() {
    return playerChar.getOffsetInWorldCoords(0, DISTANCE_TO_PICKUP, 0);
}

function isArmorFull(amount) {
    return amount >= ARMOR_LIMIT;
}

function dropArmor() {
    const armorCount = playerChar.getArmor();
    if (armorCount <= 0) {
        return;
    }

    playerChar.addArmor(armorCount * -1);
    if (!isArmorFull(armorCount)) {
        showTextBox("Body armor discarded");
        return;
    }

    const location = getDropLocation();
    Pickup.Create(1242, PickupType.Once, location.x, location.y, location.z);
    showTextBox("Body armor dropped");
}

function dropWeapon() {
    const weaponType = playerChar.getCurrentWeapon();
    if (weaponType === WeaponType.Unarmed) {
        dropArmor();
        return;
    }

    const ammo = playerChar.getAmmoInWeapon(weaponType);
    const weaponModel = Weapon.GetModel(weaponType);
    const weaponName = WeaponType[weaponType];
    let location = getDropLocation();

    playerChar.removeWeapon(weaponType);
    Pickup.CreateWithAmmo(weaponModel, PickupType.Once, ammo, location.x, location.y, location.z);
    showTextBox(`${weaponName} dropped`);
}

function loop() {
    // Dead or arrested: skip
    if (!player.isPlaying() || player.isDead()) {
        wait(5000);
        return;
    }

    if (padButtonsPressed(KEY_DROP_GAMEPAD_BUTTONS)) {
        dropWeapon();
    }
}

// noinspection InfiniteLoopJS
while (true) {
    wait(10);
    loop();
}
