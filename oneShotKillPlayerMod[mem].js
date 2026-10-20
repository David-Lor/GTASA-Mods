/// <reference path=".config/sa.d.ts" />

import {WeaponType} from ".config/sa.enums.mts";

/** @type {WeaponType[]} */
const FIREARMS = [
    WeaponType.Pistol,
    WeaponType.PistolSilenced,
    WeaponType.DesertEagle,
    WeaponType.Shotgun,
    WeaponType.Sawnoff,
    WeaponType.Spas12,
    WeaponType.MicroUzi,
    WeaponType.Mp5,
    WeaponType.Ak47,
    WeaponType.M4,
    WeaponType.Tec9,
    WeaponType.Rifle,
    WeaponType.Sniper,
    WeaponType.Minigun
];

const player = new Player(0);
const playerChar = player.getChar();

while (true) {
    wait(10);

    if (player.isDead()) {
        wait(2000);
        continue;
    }

    for (const weapon of FIREARMS) {
        if (playerChar.hasBeenDamagedByWeapon(weapon) && playerChar.getArmor() === 0) {
            playerChar.setHealth(0);
            break;
        }
    }
    playerChar.clearLastWeaponDamage();
}
