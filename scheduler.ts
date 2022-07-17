import { TimeoutLatch, TimeoutLatchConstructor } from "./timeout-latch";
const latches: TimeoutLatch[] = [];
export function scheduleTimeoutLatch(
    ...params: TimeoutLatchConstructor
) {
    const latch = new TimeoutLatch(...params);
    latches.push(latch);
    return latch;
}

let schedulerTimer: any;
function startScheduler() {
    return setInterval(
        () => {
            if (!latches.length) {
                if (schedulerTimer) {
                    clearInterval(schedulerTimer);
                    schedulerTimer = undefined;
                }
            }
            for (let index = 0; index < latches.length; index++) {
                const latch = latches[index];
                if (!latch.isDone) {
                    latch.reduceTimeLeft(1);
                } else {
                    latches.splice(index, 1);
                    latch.registerOnResetCallback(() => {
                        latch.clearResetCallback();
                        latches.push(latch);

                        if (!schedulerTimer) {
                            schedulerTimer = startScheduler();
                        }
                    });
                }
            }
        },
        1,
    )
}

schedulerTimer = startScheduler();