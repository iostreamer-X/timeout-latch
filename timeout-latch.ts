export type TimeoutLatchConstructor = [timeoutMS: number, onTimeExhaustedCallback?: Function];
export class TimeoutLatch {
    private timeLeftMS: number;
    private isCancelled: boolean = false;
    private _isTimeExhausted: boolean = false;
    readonly timeoutMS: number;
    private onTimeExhaustedCallback?: Function;
    private onResetCallback?: Function;

    constructor(...params: TimeoutLatchConstructor) {
        this.timeoutMS = params[0];
        this.timeLeftMS = this.timeoutMS;
        this.onTimeExhaustedCallback = params[1];
    }

    reset() {
        this.timeLeftMS = this.timeoutMS;
        this.isCancelled = false;
        this.isTimeExhausted = false;

        if (this.onResetCallback) {
            this.onResetCallback();
        }
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

    set isTimeExhausted(flag: boolean) {
        this._isTimeExhausted = flag;
        if (flag) {
            this.onTimeExhausted();
        }
    }

    get isTimeExhausted() {
        return this._isTimeExhausted;
    }

    onTimeExhausted() {
        if (this.onTimeExhaustedCallback) {
            this.onTimeExhaustedCallback();
        }
    }

    registerOnTimeExhaustedCallback(callback: Function) {
        this.onTimeExhaustedCallback = callback;
    }
    clearTimeExhaustedCallback() {
        this.onTimeExhaustedCallback = undefined;
    }

    registerOnResetCallback(callback: Function) {
        this.onResetCallback = callback;
    }

    clearResetCallback() {
        this.onResetCallback = undefined;
    }
}