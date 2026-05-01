import { AccessCode } from './access_code';
import type { AccessField } from './access_field';
import { BaseFrameLength } from './base_frame_length';
import { IMM } from './imm';
import type { Sim } from './sim';
import { TickTransmitted, type Tick } from './tick';
import { SLOTS_PER_FRAME, TDMATime } from './time';

export enum State {

    // The MS is idle and has no message to send
    Idle,

    // MS has a message to transmit and is waiting for IMM
    HasMessageToSend,

    // MS is waiting for an access frame
    WaitingForAccessFrame,

    // MS has obtained an access frame, decided on a subslot and is waiting for it
    WaitingForRandomSubslotWithinAccessFrame,

    // MS has transmitted and is waiting for a response
    WaitingForResponse,

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

    // The number of IMM slots remaining for the MS
    private immSlotsLeft = 0;

    // The number of WT downlink opportunities left for this MS
    private wtOpportunities = 0;

    // The current number of attempts left for the MS
    private attemptsLeft = 0;

    // The calculated random subslot index that this MS will attempt to transmit in within the current access frame
    private randomSubslotIndex = 0;

    // How many subslots we have skipped over while waiting for our selected random subslot within the access frame
    private subslotsWaited = 0;

    // Has a message been requested?
    private messageRequested = false;

    // Has a response been provided?
    private responseProvided = false;

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
     * Mark the MS has having received a response.
     */
    public provideResponse() {
        this.responseProvided = true;
    }

    /**
     * Reset the MS to its initial state.
     */
    public reset() {
        this.state = State.Idle;
        this.messageRequested = false;
        this.responseProvided = false;
    }

    /**
     * Get the current state of the MS.
     */
    public getState(): State {
        return this.state;
    }

    public getStateDescription(): string {
        switch (this.state) {
            case State.Idle:
                return "Idle";
            case State.HasMessageToSend:
                return "Waiting for Opportunity (" + this.immSlotsLeft + " slots left)";
            case State.WaitingForAccessFrame:
                return "Waiting for Access Frame";
            case State.WaitingForRandomSubslotWithinAccessFrame:
                return "Waiting for Random Subslot (" + this.subslotsWaited + "/" + this.randomSubslotIndex + ")";
            case State.WaitingForResponse:
                return "Waiting for Response (" + this.wtOpportunities + " opportunities left)";
            case State.GivenUp:
                return "Given Up";
            case State.Succeeded:
                return "Succeeded";
        }
    }   
    
    private subslotIsValidAccessOpportunity(time: TDMATime, field: AccessField): boolean {
        
        // Matches access code?
        if (field.accessCode !== this.accessCode) {
            return false;
        }

        // Matches 'timeslot pointer'?
        let timeslotIndex = time.getSlot() - 1;
        if (!this.accessCode.timeslotPointer[timeslotIndex]) {
            return false;
        }

        // Reserved?
        if (time.isCLCH()) {
            return false;
        }

        // Otherwise, this subslot is valid for this MS to attempt to transmit in
        return true;
    }

    /**
     * Determine if a subslot contains a suitable access frame start. 
     */
    private isSuitableStartOfAccessFrame(time: TDMATime, field: AccessField): boolean {

        // Matches access code?
        if (field.accessCode !== this.accessCode) {
            return false;
        }

        // Reserved, Ongoing or CLCH?
        if (field.baseFrameLength < BaseFrameLength.Subslot1) {
            return false;
        }

        return true;
    }

    /**
     * Advance this MS's state machine.
     * Accepts the TDMA time and the two access fields for the subslots in this slot.
     * 
     * Returns a Tick that represents the action/state change that occurred.
     */
    tick(time: TDMATime, subslotFields: [AccessField, AccessField]): Tick {

        switch (this.state) {

            case State.Idle:

                // Decide if we should transition to the "HasMessageToSend" state based on the stimulus
                if (this.messageRequested) {
                    this.state = State.HasMessageToSend;

                    // IMM is in *frames*, but we're counting in slots, so we need to convert it to slots here
                    this.immSlotsLeft = this.accessCode.imm * SLOTS_PER_FRAME;
                    this.wtOpportunities = this.accessCode.wt;
                    this.attemptsLeft = this.accessCode.nu;

                    // If "always randomise" is set, then we skip straight to waiting for an access frame
                    if (this.accessCode.imm == IMM.AlwaysRandomise) {
                        this.state = State.WaitingForAccessFrame;
                    }
                }
                
                break;

            case State.HasMessageToSend:

                // Check if the current slot is a valid opportunity to transmit based on the access code
                let validSubslots = [];
                if (this.subslotIsValidAccessOpportunity(time, subslotFields[0])) {
                    validSubslots.push(0);
                }
                if (this.subslotIsValidAccessOpportunity(time, subslotFields[1])) {
                    validSubslots.push(1);
                }

                // If *both* are valid, select one at random to attempt to transmit in
                if (validSubslots.length == 2) {
                    if (Math.random() < 0.5) {
                        validSubslots.pop();
                    } else {
                        validSubslots.shift();
                    }
                }

                if (validSubslots.length > 0) {
                    // Attempt to transmit in the selected subslot
                    this.state = State.WaitingForResponse;
                    return new TickTransmitted(validSubslots[0]!);
                }

                // Has IMM expired?
                if (this.immSlotsLeft == 0) {
                    this.state = State.WaitingForAccessFrame;
                } else {
                    this.immSlotsLeft--;
                }

                break;

            case State.WaitingForAccessFrame:

                let frameLength: number|null = null;

                // Check the first subslot for the start of a suitable access frame
                if (this.isSuitableStartOfAccessFrame(time, subslotFields[0])) {
                    frameLength = subslotFields[0].baseFrameLength;
                }
                
                // If not found in the first subslot, check the second subslot for the start of a suitable access frame
                if (frameLength === null && this.isSuitableStartOfAccessFrame(time, subslotFields[1])) {
                    frameLength = subslotFields[1].baseFrameLength;
                }

                if (frameLength !== null) {
                    // We found the start of a suitable access frame, so we calculate the random subslot index that we will attempt to transmit in within this access frame
                    this.randomSubslotIndex = Math.floor(Math.random() * frameLength);
                    this.subslotsWaited = 0;
                    this.state = State.WaitingForRandomSubslotWithinAccessFrame;
                }

                break;

            case State.WaitingForResponse:
                
                // Check if a response has been provided
                if (this.responseProvided) {
                    this.state = State.Succeeded;
                }

                // TODO: Count "downlink signalling opportunities", whatever they are...

            case State.WaitingForRandomSubslotWithinAccessFrame:

                break;

        }

        return false;
    }

}