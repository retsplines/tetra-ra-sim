import type { TDMATime } from "../time";
import { ConstantStimulus } from "./constant";
import { GaussianStimulus } from "./gaussian";
import { UniformStimulus } from "./uniform";

/**
 * A strategy for determining when to apply a stimulus within the simulation.
 */
export interface StimulusStrategy {
    shouldProc: (time: TDMATime) => boolean;
}

// Export a list of the available stimulus strategies for use in the UI
export const strategies = [
    UniformStimulus,
    GaussianStimulus,
    ConstantStimulus
];
