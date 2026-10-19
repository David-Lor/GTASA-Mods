/// <reference path=".config/sa.d.ts" />

const player = new Player(0);

while (true) {
    wait(50);

    try {
        if (Pad.IsButtonPressed(0, 15) && Pad.IsButtonPressed(0, 16)) {
            const car = getPlayerCar();
            if (car !== null) {
                car.setEngineOn(false);
                wait(2000);
            }
        }
    } catch (e) {
        // TODO Log
    }
}

function getPlayerCar() {
    if (!player.isPlaying()) return null;

    const ped = player.getChar();
    if (!ped.isInAnyCar()) return null;

    const car = ped.getCarIsUsing();
    if (!car.isEngineOn()) return null;

    return car;
}
