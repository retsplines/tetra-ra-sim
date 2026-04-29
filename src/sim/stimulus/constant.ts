import type { TDMATime } from "../time";
import type { StimulusStrategy } from "./stimulus_strategy";

/**
 * A stimulus strategy that procs at a specific timestamp only.
 */
export class ConstantStimulus implements StimulusStrategy {
    
    constructor(private timestamp: number) {}
        
    shouldProc(time: TDMATime): boolean {
        return time.timestamp() === this.timestamp;
    }
}
