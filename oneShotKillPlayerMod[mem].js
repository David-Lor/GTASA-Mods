/// <reference path=".config/sa.d.ts" />

const FIREARMS = [
    22, // Pistola 9mm
    23, // Pistola silenciada
    24, // Desert Eagle
    25, // Escopeta
    26, // Recortada
    27, // Escopeta de combate
    28, // Micro SMG / Uzi
    29, // MP5
    30, // AK-47
    31, // M4
    32, // Tec-9
    33, // Rifle
    34, // Sniper
    38  // Minigun
];

const player = new Player(0);
const playerChar = player.getChar();

while (true) {
    wait(0);

    if (!player.isDead()) {
        for (const weapon of FIREARMS) {
            if (playerChar.hasBeenDamagedByWeapon(weapon)) {
                playerChar.setHealth(0);
                break;
            }
        }
        playerChar.clearLastWeaponDamage();
    }
}