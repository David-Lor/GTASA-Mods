/// <reference path="../.config/sa.d.ts" />

const AMMUNATIONS = ["AMMUN1", "AMMUN2", "AMMUN3", "AMMUN4", "AMMUN5"];

// Wait for player to be ready
wait(0);
const player = new Player(0);
while (!player.isPlaying()) wait(100);
wait(2000);

for (const name of AMMUNATIONS) {
    World.SwitchEntryExit(name, true);
}

showTextBox("Opened Ammunation stores");
