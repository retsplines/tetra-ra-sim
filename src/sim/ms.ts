import { AccessCode } from './access_code';
import { IMM } from './imm';
import type { Sim } from './sim';
import type { Tick } from './tick';
import type { TDMATime } from './time';

export enum State {

    // The MS is idle and has no message to send
    Idle,

    // MS has a message to transmit and is waiting for IMM
    HasMessageToSend,

    // MS is waiting for an access frame
    WaitingForAccessFrame,

    // MS has obtained an access frame, decided on a subslot and is waiting for it
    WaitingForRandomSubslotWithinAccessFrame,

    // MS has given up (WT expired)
    GivenUp,

    // MS has successfully transmitted its message
    Succeeded
}

/**
 * A single mobile station (MS) within the simulation.
 * This class tracks the state of a single mobile station.
 */
export class MS {

    // The current state of this MS
    private state: State = State.Idle;

    // The current "imm" value for the MS
    private imm = 0;

    // The current "WT" value for the MS
    private wt = 0;

    // The current "nu" value for the MS
    private nu = 0;

    // The calculated random subslot index that this MS will attempt to transmit in within the current access frame
    private randomSubslotIndex = 0;

    // Has a message been requested?
    private messageRequested = false;

    constructor(
        public readonly issi: number,
        public accessCode: AccessCode,
        public readonly sim: Sim
    ) {
        // Initialize the MS instance
    }

    /**
     * Mark the MS as having a message to send.
     */
    public requestMessage() {
        this.messageRequested = true;
    }

    /**
     * Get the current state of the MS.
     */
    public getState(): State {
        return this.state;
    }

    /**
     * Advance this MS's state machine.
     * Returns a Tick that represents the action/state change that occurred.
     */
    tick(time: TDMATime): Tick {

        switch (this.state) {

            case State.Idle:

                // Decide if we should transition to the "HasMessageToSend" state based on the stimulus
                if (this.messageRequested) {
                    this.state = State.HasMessageToSend;
                    this.imm = this.accessCode.imm;
                    this.nu = this.accessCode.nu;

                    // If "always randomise" is set, then we skip straight to waiting for an access frame
                    if (this.accessCode.imm == IMM.AlwaysRandomise) {
                        this.state = State.WaitingForAccessFrame;
                    }
                }
                
                break;

            case State.HasMessageToSend:

                // Is this an opportunity?
                // TODO: Check - if it *is* an opportunity, then there's a 50:50 chance of the MS picking this subslot or the next one

                // Has IMM expired?
                if (this.imm == 0) {
                    this.state = State.WaitingForAccessFrame;
                } else {
                    this.imm--;
                }

                break;

            case State.WaitingForAccessFrame:

                // Is this the start of an access frame?
                // TODO: Check

                break;

            case State.WaitingForRandomSubslotWithinAccessFrame:

                break;

        }

        return false;
    }

}