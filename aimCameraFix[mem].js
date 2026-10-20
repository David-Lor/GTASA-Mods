/// <reference path=".config/sa.d.ts" />

const PAD = 0;
const POLL_MS = 16;  // Memory.Watch interval (~1 frame @ 60 fps)

const REAPPLY_COUNT = 3;  // extra reapplications (0 = only once)
const REAPPLY_EVERY_MS = 30;


function cameraHeading() {
    const cam = Camera.GetActiveCoordinates();
    const at = Camera.GetActivePointAt();
    const dx = at.x - cam.x;
    const dy = at.y - cam.y;

    if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return null;

    let h = (Math.atan2(-dx, dy) * 180) / Math.PI;
    if (h < 0) h += 360;
    return h;
}

(async function () {
    const player = new Player(0);

    const aiming = () => {
        if (!player.isPlaying()) return false;
        if (player.getChar().isInAnyCar()) return false;
        return Pad.IsAimButtonPressed(PAD);
    };

    Memory.Watch(
        aiming,
        async (isAiming, wasAiming) => {
            if (!isAiming || wasAiming) return;

            for (let i = 0; i <= REAPPLY_COUNT; i++) {
                if (!aiming()) return;
                const h = cameraHeading();
                if (h !== null) player.getChar().setHeading(h);
                if (i < REAPPLY_COUNT) await asyncWait(REAPPLY_EVERY_MS);
            }
        },
        POLL_MS
    );

    while (true) {
        await asyncWait(1000);
    }
})();
