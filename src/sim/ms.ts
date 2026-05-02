import { AccessCode } from './access_code';
import type { AccessField } from './access_field';
import { BaseFrameLength, getSubslotCount } from './base_frame_length';
import { IMM } from './imm';
import type { Sim } from './sim';
import { TickAborted, TickTransmitted, type TickEvent } from './tick';
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

    // The access code that was used when choosing from the access frame
    private usedAccessCode: AccessCode|null = null;

    // How many subslots we have skipped over while waiting for our selected random subslot within the access frame
    private subslotsWaited = 0;

    // The slot number in which our request was made, used to determine when WT expires
    private requestSlot = 0;

    // Has a response been provided?
    private responseProvided = false;

    constructor(
        public readonly issi: number,
        public accessCode: AccessCode,
        public readonly sim: Sim
    ) {
        // Initialize the MS instance
    }

    private log(...args: any[]) {
        console.log(`[MS ${this.issi}]`, ...args);
    }

    /**
     * Mark the MS as having a message to send.
     */
    public requestMessage() {
        
        this.state = State.HasMessageToSend;

        // IMM is in *frames*, but we're counting in slots, so we need to convert it to slots here
        this.immSlotsLeft = this.accessCode.imm * SLOTS_PER_FRAME;
        this.attemptsLeft = this.accessCode.nu;

        // If "always randomise" is set, then we skip straight to waiting for an access frame
        if (this.accessCode.imm == IMM.AlwaysRandomise) {
            this.state = State.WaitingForAccessFrame;
        }
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
                return "Waiting for Random Subslot (counted " + this.subslotsWaited + "/" + this.randomSubslotIndex + ")";
            case State.WaitingForResponse:
                return "Waiting for Response (" + this.wtOpportunities + " opportunities left)";
            case State.GivenUp:
                return "Given Up";
            case State.Succeeded:
                return "Succeeded";
        }
    }   
    
    /**
     * Check if a subslot is countable for the purposes of waiting for the random subslot within the access frame.
     * The criteria for this is set out in 23.5.1.4.7:
     * 
     * - it was indicated by element "Timeslot Pointer"
     * - the subslot is marked with the appropriate access code, i.e. the access code used when choosing from the access frame.
     * - the subslot is not designated as reserved or assigned for linearization.
     */
    private subslotIsCountableWithinAccessFrame(time: TDMATime, field: AccessField): boolean {

        // Same as the access code for the access frame?
        if (field.accessCode !== this.usedAccessCode) {
            this.log(`Subslot ${time.toString()} does not match access code used for access frame.`);
            return false;
        }

        // Matches 'timeslot pointer'?
        let timeslotIndex = time.getSlot() - 1;
        if (!this.usedAccessCode!.timeslotPointer[timeslotIndex]) {
            this.log(`Subslot ${time.toString()}-${timeslotIndex + 1} does not match timeslot pointer of access code used for access frame.`);
            return false;
        }

        // Reserved or assigned for linearization?
        if (field.baseFrameLength == BaseFrameLength.ReservedSubslot || field.baseFrameLength == BaseFrameLength.CLCHSubslot) {
            this.log(`Subslot ${time.toString()}-${timeslotIndex + 1} is not countable within access frame because it is reserved/CLCH.`);
            return false;
        }

        return true;
    }

    /**
     * Check if a subslot is a valid opportunity for the MS to attempt a transmission.
     */
    private subslotIsValidAccessOpportunity(time: TDMATime, field: AccessField): boolean {
        
        // Matches access code?
        if (field.accessCode !== this.accessCode) {
            this.log(`Subslot ${time.toString()} does not match MS access code.`);
            return false;
        }

        // Matches 'timeslot pointer'?
        let timeslotIndex = time.getSlot() - 1;
        if (!this.accessCode.timeslotPointer[timeslotIndex]) {
            this.log(`Subslot ${time.toString()} does not match MS timeslot pointer.`);
            return false;
        }

        // Reserved?
        if (field.baseFrameLength == BaseFrameLength.ReservedSubslot || field.baseFrameLength == BaseFrameLength.CLCHSubslot) {
            this.log(`Subslot ${time.toString()} is reserved/CLCH.`);
            return false;
        }

        // Otherwise, this subslot is valid for this MS to attempt to transmit in
        this.log(`Subslot ${time.toString()} is a valid Tx opportunity`);
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
     * Reset the MS's state to reflect that it has just transmitted.
     */
    private transmit(time: TDMATime) {
        this.log(`Transmitting in slot ${time.toString()}...`);
        this.wtOpportunities = this.accessCode.wt;
        this.requestSlot = time.getSlot();
        this.subslotsWaited = 0;
        this.state = State.WaitingForResponse;
    }

    /**
     * Check if a subslot is countable, and if so, check if it is the random subslot we are waiting for within the access frame.
     * Return true if we should attempt to transmit in this subslot, false otherwise.
     */
    private checkRandomSubslot(time: TDMATime, accessField: AccessField, subslotIndex: number): boolean {

        this.log(`Checking if subslot ${time.toString()}-${subslotIndex + 1} counts towards waiting for random subslot...`);
        if (this.subslotIsCountableWithinAccessFrame(time, accessField)) {
            if (this.subslotsWaited == this.randomSubslotIndex) {
                // This is the subslot we selected, so we attempt to transmit here
                this.log(`Subslot ${time.toString()}-${subslotIndex + 1} is the random subslot we are looking for!`);
                this.transmit(time);
                return true;
            } else {
                // Not there yet, but this subslot counts towards waiting for the random subslot
                this.subslotsWaited ++;
                this.log(`Subslot ${time.toString()}-${subslotIndex + 1} counts towards waiting for random subslot. Waited ${this.subslotsWaited}/${this.randomSubslotIndex}.`);
            }
        } else {
            this.log(`Subslot ${time.toString()}-${subslotIndex + 1} does not count towards waiting for random subslot.`);
        }
        

        return false;
    }

    /**
     * Advance this MS's state machine.
     * Accepts the TDMA time and the two access fields for the subslots in this slot.
     */
    tick(time: TDMATime, subslotFields: [AccessField, AccessField]): TickEvent|null {

        switch (this.state) {

            case State.Idle:
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
                    this.log(`Both subslots are valid opportunities, randomly selecting one...`);
                    if (Math.random() < 0.5) {
                        validSubslots.pop();
                    } else {
                        validSubslots.shift();
                    }
                }

                if (validSubslots.length > 0) {
                    // Attempt to transmit in the selected subslot
                    this.transmit(time);
                    return new TickTransmitted(validSubslots[0]! as 0 | 1);
                }

                // Has IMM expired?
                if (this.immSlotsLeft == 0) {
                    this.log(`IMM expired, randomising...`);
                    this.state = State.WaitingForAccessFrame;
                } else {
                    this.immSlotsLeft--;
                }

                break;

            case State.WaitingForAccessFrame:

                let subslotField: AccessField|null = null;
                let subslotUsed = 0;

                // Check the first subslot for the start of a suitable access frame
                if (this.isSuitableStartOfAccessFrame(time, subslotFields[0])) {
                    subslotField = subslotFields[0];
                    subslotUsed = 0;
                }
                
                // If not found in the first subslot, check the second subslot for the start of a suitable access frame
                if (subslotField === null && this.isSuitableStartOfAccessFrame(time, subslotFields[1])) {
                    subslotField = subslotFields[1];
                    subslotUsed = 1;
                }

                if (subslotField !== null) {
                    
                    const calculatedAccessFrameLength = getSubslotCount(subslotField.baseFrameLength) * (this.accessCode.frameLengthFactor ? 4 : 1);
                    this.log(`Found suitable access frame (len ${calculatedAccessFrameLength}) starting at subslot ${time.toString()}-${subslotUsed + 1}`);

                    // We found the start of a suitable access frame
                    // Calculate the random subslot index that we will attempt to transmit in within this access frame
                    this.randomSubslotIndex = Math.floor(Math.random() * calculatedAccessFrameLength);
                    this.subslotsWaited = 0;
                    this.log(`Randomly selected subslot index ${this.randomSubslotIndex} within access frame to attempt to transmit in.`);

                    // Remember the access code we used
                    this.usedAccessCode = subslotField.accessCode;

                    // Tricky...
                    // 23.5.1.4.7 says:
                    // "The uplink subslot corresponding to the frame marker access field is defined as the first subslot in the access frame."
                    
                    // Transition to waiting for the random subslot within the access frame
                    this.state = State.WaitingForRandomSubslotWithinAccessFrame;

                    // Started in the first subslot?
                    if (subslotUsed == 0) {
                        this.checkRandomSubslot(time, subslotFields[0], 0);
                    }

                    // Always check the second subslot as well
                    this.checkRandomSubslot(time, subslotFields[1], 1);
                }

                break;

            case State.WaitingForResponse:
                
                // Responses can only be received in downlink signalling opportunities
                // These are same-numbered slots as the slot we sent our request in.
                if (time.getSlot() == this.requestSlot) {
                    
                    if (this.responseProvided) {
                        this.state = State.Succeeded;
                        this.log(`Response received, transmission succeeded.`);
                    } else {
                        this.wtOpportunities--;
                        this.log(`Downlink opportunity for response, but no response provided. WT opportunities left: ${this.wtOpportunities}.`);
                    }

                    if (this.wtOpportunities <= 0) {

                        // Retries exhausted?
                        if (this.attemptsLeft == 0) {
                            this.log(`WT expired and no attempts left, giving up.`);
                            this.state = State.GivenUp;
                            return new TickAborted();
                        } else {
                            // Otherwise, we go back to waiting for an access frame to try again
                            this.attemptsLeft--;
                            this.log(`WT expired, attempts left: ${this.attemptsLeft}. Re-trying...`);
                            this.state = State.WaitingForAccessFrame;
                        }
                    }
                }

                break;

            case State.WaitingForRandomSubslotWithinAccessFrame:

                // Check if either of the subslots in this slot are to be counted
                for (let i = 0; i < subslotFields.length; i++) {
                    if (this.checkRandomSubslot(time, subslotFields[i]!, i)) {
                        break;
                    }
                }

                break;

        }

        return null;
    }

}