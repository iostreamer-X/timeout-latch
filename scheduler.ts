import { TimeoutLatch, TimeoutLatchConstructor } from "./timeout-latch";

class Scheduler {
    private latches: TimeoutLatch[] = [];
    private timer: number | undefined;
    private isRunning = false;

    tick() {
        if (!this.latches.length) {
            this.stop();
        }

        for (let index = 0; index < this.latches.length; index++) {
            const latch = this.latches[index];
            if (!latch.isDone) {
                latch.reduceTimeLeft(1);
                continue;
            }
            this.latches.splice(index, 1);
            latch.registerOnResetCallback(() => {
                latch.clearResetCallback();
                this.latches.push(latch);

                if (!this.isRunning) {
                    this.start();
                }
            });
        }
    }


    stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        clearTimeout(this.timer);
    }

    start() {
        if (this.isRunning) {
            return;
        }
        this.timer = setInterval(this.tick.bind(this), 1);
        this.isRunning = true;
    }

    scheduleTimeoutLatch(
        ...params: TimeoutLatchConstructor
    ) {
        const latch = new TimeoutLatch(...params);
        this.latches.push(latch);
        return latch;
    }
}

const scheduler = new Scheduler();
scheduler.start();
export const scheduleTimeoutLatch = scheduler.scheduleTimeoutLatch.bind(scheduler);