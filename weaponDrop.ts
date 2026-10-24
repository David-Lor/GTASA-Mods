/// <reference path=".config/sa.d.ts" />
import {Button, FileMode, KeyCode, PadId, PickupType, WeaponType} from ".config/sa.enums.mts";

const KEY_DROP_GAMEPAD_BUTTONS: Button[] = [
    Button.LeftShoulder1,
    Button.RightShoulder1,
    Button.DpadDown
];

const DISTANCE_TO_PICKUP: float = 2.5;
const ARMOR_LIMIT = 80;
const SAVE_FILE_LOCATION = "weaponDrop2.save.ndjson";
const DEVMODE = false;

const padButtonsStatus = new Map<Button[], boolean>();
const player = new Player(0);
const playerChar = player.getChar();
const pickups: PickupPersist[] = [];

class PickupPersist {
    pickup?: Pickup;

    weaponType: WeaponType;
    weaponName: string;
    ammo?: number;
    location: Vector3;

    spawn() {
        if (this.weaponType === WeaponType.Armour) {
            this.pickup = Pickup.Create(
                1242,
                PickupType.Once,
                this.location.x, this.location.y, this.location.z
            );
        } else {
            this.pickup = Pickup.CreateWithAmmo(
                Weapon.GetModel(this.weaponType),
                PickupType.Once,
                this.ammo,
                this.location.x, this.location.y, this.location.z
            );
        }
        log(`Spawned pickup: weapon=${this.weaponName} location=${JSON.stringify(this.location)} ammo=${this.ammo} id=${this.id()}`);
    }

    id() {
        const data = [
            this.weaponType,
            this.ammo,
            this.location.x,
            this.location.y,
            this.location.z
        ]
        return data.join('/');
    }
}

function loadPickups() {
    const file = File.Open(SAVE_FILE_LOCATION, FileMode.ReadText);
    if (!file) {
        return;
    }

    const size = file.getSize() + 1;
    const buff = Memory.Allocate(size);

    let lines = [];
    while (file.readString(buff as any, size)) {
        lines.push(Memory.ReadUtf8(buff));
    }
    file.close();

    log("Read lines: " + lines);

    for (let line of lines) {
        line = line.trim();
        if (!line || line === "") {
            continue;
        }

        try {
            const pickup = JSON.parse(line) as PickupPersist;
            pickups.push(pickup);
        } catch (e) {}
    }
}

function savePickups() {
    const lines = pickups.map(pickup => JSON.stringify({...pickup, pickup: undefined}));
    const content = lines.join("\n")+"\n";

    const file = File.Open(SAVE_FILE_LOCATION, FileMode.WriteText);
    if (!file) {
        showTextBox("WeaponDrop: failed to open save file for writing");
        return;
    }

    file.writeString(content);
    //wait(500);
    //file.close();
    showTextBox("WeaponDrop: persisted drops");
}


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

    if (isArmorFull(armorCount)) {
        let location = getDropLocation();
        Pickup.Create(1242, PickupType.Once, location.x, location.y, location.z);
        showTextBox("Body armor dropped");
    } else {
        showTextBox("Body armor discarded");
    }
}

function dropWeapon() {
    const weaponType = playerChar.getCurrentWeapon();
    if (weaponType === WeaponType.Unarmed) {
        dropArmor();
        return;
    }

    const ammo = playerChar.getAmmoInWeapon(weaponType);
    //const weaponModel = Weapon.GetModel(weaponType);
    let location = getDropLocation();

    //playerChar.removeWeapon(weaponType);
    //const pickup = Pickup.CreateWithAmmo(weaponModel, PickupType.Once, ammo, location.x, location.y, location.z);

    const pickupPersist = new PickupPersist();
    pickupPersist.weaponType = weaponType;
    pickupPersist.weaponName = WeaponType[weaponType];
    pickupPersist.ammo = ammo;
    pickupPersist.location = location;
    pickups.push(pickupPersist);

    playerChar.removeWeapon(weaponType);
    pickupPersist.spawn()

    showTextBox(`Drop ${WeaponType[weaponType]}`);
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

    if (DEVMODE && Pad.IsKeyUp(KeyCode.P)) {
        savePickups();
    } else if (DEVMODE && Pad.IsKeyUp(KeyCode.O)) {
        loadPickups();
    }
}

function init() {
    loadPickups();
}

init();

// noinspection InfiniteLoopJS
while (true) {
    wait(10);
    loop();
}
