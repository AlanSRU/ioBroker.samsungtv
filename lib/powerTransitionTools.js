'use strict';

// While a power command is in flight, polls keep reading the TV but only publish the
// requested value, or the measured one once the transition has timed out. Either ends it.
function acceptPowerUpdate(device, observed, now) {
    const transition = device.powerTransition;
    if (!transition) {
        return true;
    }
    if (observed === transition.target || now >= transition.until) {
        delete device.powerTransition;
        return true;
    }
    return false;
}

// Polls every `interval` ms until a poll ends the transition, `duration` ms have passed,
// or a newer power command replaces it.
function startPowerTransition(device, target, { poll, schedule, now, interval, duration }) {
    const transition = { target, until: now() + duration };
    device.powerTransition = transition;
    const tick = async () => {
        if (device.powerTransition !== transition) {
            return;
        }
        await poll();
        if (device.powerTransition === transition && now() < transition.until) {
            schedule(tick, interval);
        }
    };
    schedule(tick, interval);
}

module.exports = { acceptPowerUpdate, startPowerTransition };
