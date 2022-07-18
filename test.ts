import { scheduleTimeoutLatch } from "./index";

const latch = scheduleTimeoutLatch(3000);
latch.registerOnTimeExhaustedCallback(() => {
    console.log('done');
})

setTimeout(
    () => {
        latch.reset();
    },
    8000,
)
