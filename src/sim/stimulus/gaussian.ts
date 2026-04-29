import type { TDMATime } from "../time";
import type { StimulusStrategy } from "./stimulus_strategy";

/**
 * A stimulus strategy that applies a stimulus according to a Gaussian distribution.
 */
export class GaussianStimulus implements StimulusStrategy {

    constructor(private mean: number, private stddev: number) {}

    shouldProc(time: TDMATime): boolean {
        const timestamp = time.timestamp();
        const z = (timestamp - this.mean) / this.stddev;
        const probability = Math.exp(-0.5 * z * z) / (this.stddev * Math.sqrt(2 * Math.PI));
        return Math.random() < probability;
    }
}
