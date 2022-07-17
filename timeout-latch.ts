export type TimeoutLatchConstructor = [timeoutMS: number, onTimeExhaustedCallback?: Function];
export class TimeoutLatch {
    private timeLeftMS: number;
    private isCancelled: boolean = false;
    private _isTimeExhausted: boolean = false;
    readonly timeoutMS: number;
    private onTimeExhaustedCallbacks: Function[] = [];
    private onResetCallbacks: Function[] = [];

    constructor(...params: TimeoutLatchConstructor) {
        this.timeoutMS = params[0];
        this.timeLeftMS = this.timeoutMS;
        if (params[1]) {
            this.onTimeExhaustedCallbacks.push(params[1]);
        }
    }

    reset() {
        this.timeLeftMS = this.timeoutMS;
        this.isCancelled = false;
        this.isTimeExhausted = false;

        this.runAllResetCallbacks();
    }

    reduceTimeLeft(
        timeMS: number,
    ) {
        if (this.isCancelled) {
            console.warn('timeout-latch already cancelled!');
            return;
        }
        if (this.isTimeExhausted) {
            console.warn('timeLeft already exhausted!');
            return;
        }
        this.timeLeftMS -= timeMS;

        if (this.timeLeftMS <= 0) {
            this.isTimeExhausted = true;
        }
    }

    cancel() {
        if (this.isCancelled) {
            console.warn('timeout-latch already cancelled!');
            return;
        }
        this.isCancelled = true;
    }

    get isDone(): boolean {
        return this.isCancelled || this.isTimeExhausted;
    }

    private set isTimeExhausted(flag: boolean) {
        this._isTimeExhausted = flag;
        if (flag) {
            this.onTimeExhausted();
        }
    }

    private get isTimeExhausted() {
        return this._isTimeExhausted;
    }

    private onTimeExhausted() {
        this.runAllTimeExhaustedCallbacks();
    }

    registerOnTimeExhaustedCallback(callback: Function) {
        this.onTimeExhaustedCallbacks.push(callback);
    }
    clearTimeExhaustedCallback(functionReference: Function) {
        this.onTimeExhaustedCallbacks.splice(
            this.onTimeExhaustedCallbacks.indexOf(functionReference), 
        1);
    }
    private runAllTimeExhaustedCallbacks() {
        for (const callback of this.onTimeExhaustedCallbacks) {
            callback();
        }
    }

    registerOnResetCallback(callback: Function) {
        this.onResetCallbacks.push(callback);
    }

    clearResetCallback(functionReference: Function) {
        this.onResetCallbacks.splice(
            this.onResetCallbacks.indexOf(functionReference), 
        1);
    }

    private runAllResetCallbacks() {
        for (const callback of this.onResetCallbacks) {
            setTimeout(
                callback,
                0
            )
        }
    }
}