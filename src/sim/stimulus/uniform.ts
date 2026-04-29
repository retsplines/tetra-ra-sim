import type { TDMATime } from "../time";
import type { StimulusStrategy } from "./stimulus_strategy";

/**
 * A stimulus strategy that applies a stimulus at uniform intervals.
 */
export class UniformStimulus implements StimulusStrategy {

    constructor(private interval: number) {}
    
    shouldProc(time: TDMATime): boolean {
        return time.timestamp() % this.interval === 0;
    }

}
