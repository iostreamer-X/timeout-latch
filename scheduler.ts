import { TimeoutLatch, TimeoutLatchConstructor } from "./timeout-latch";
const latches: TimeoutLatch[] = [];
export function scheduleTimeoutLatch(
    ...params: TimeoutLatchConstructor
) {
    const latch = new TimeoutLatch(...params);
    latches.push(latch);
    return latch;
}

function schedule() {
    setInterval(
        () => {
            for (const latch of latches) {
                if (!latch.isDone) {
                    latch.reduceTimeLeft(1);
                }
            }
        },
        1,
    )
}

schedule();