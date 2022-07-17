# timeout-latch
A simple timeout latch. Like a reverse leaky bucket.

It's a simple callback based mechanism to get notified when a timeout has occurred and reset that timeout
if need arises.
Checkout the visual demo [here](https://observablehq.com/d/2531ae77ca3d9231)


## Why not plain timeout?
Plain timeouts might not work that easily. For example, one might start a timeout and manage state around it.
```js
function run() {
    setTimeout(
        () => {
            // your callback       
        },
        3000
    )
}
function reset() { // when you want to reset the timer
    run();
}
```
But we realise that resetting only works when the timeout has completed its work. If we reset before that
then we simply have two timeouts!

## How does it work?
We run a custom scheduler of our own. This scheduler essentially simulates time, and manages timeouts on its own.
The scheduler ticks every 1ms, on each tick it checks if there's a possibility of timeout. 

## Example
```js
const { scheduleTimeoutLatch } = require('timeout-latch'); //this automatically kickstarts the scheduler

const latch = scheduleTimeoutLatch(3000); // this schedules the timeout
latch.registerOnTimeExhaustedCallback(() => { // configuring the callback
    console.log('done');
})

setTimeout(
    () => {
        latch.reset(); // resetting it so that it runs again
    },
    8000,
)
```

## Latch interface
- `constructor(timeoutMS: number, callback?: Function)`
    - `timeoutMS` controls the decay time
    - `callback` if provided, will be called if latch decays fully
- `cancel()`
    - Cancels the latch and essentially puts it in stand-by mode.
- `reset()`
    - Resets the latch fully and takes it back to the original state.
    - Be it cancelled, or decayed, this functions removes all the debuffs.
- `isDone: boolean`
    - Boolean flag which tells if latch has fully decayed or not, or if it has been cancelled.
- `registerOnTimeExhaustedCallback(callback: Function)`
    - Adds callbacks to latch which will be called when it decays fully.
    - Called only on full decay, no cancelled.
- `clearTimeExhaustedCallback(functionReference: Function)`
    - Clears the associated callback
- `registerOnResetCallback(callback: Function)`
    - Adds callbacks which will be called when it resets
    - Will only be called if latch's `reset` function is called
    
