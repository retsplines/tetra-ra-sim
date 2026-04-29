import { AccessCode } from './access_code';
import type { StimulusStrategy } from './stimulus/stimulus_strategy';
import type { TDMATime } from './time';

enum State {
    Idle,
    HasMessageToSend,
    
}

/**
 * A single mobile station (MS) within the simulation.
 * This class tracks the state of a single mobile station.
 */
export class MS {

    // The current state of this MS
    private state: State = State.Idle;

    constructor(
        private messageStimulus: StimulusStrategy
    ) {
        // Initialize the MS instance
    }

    /**
     * Advance this MS's state machine.
     */
    tick(time: TDMATime) {

        switch (this.state) {

            case State.Idle:

                // Decide if we should transition to the "HasMessageToSend" state based on the stimulus
                if (this.messageStimulus.shouldProc(time)) {
                    this.state = State.HasMessageToSend;
                }
                break;
                
        }
    }
    

}