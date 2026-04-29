import type { IMM } from "./imm";

/**
 * An access code 
 */
export class AccessCode {

    constructor(
        private imm: IMM,
        private wt: number,
        private nu: number,
        private frameLengthFactor: number,
        private timeslotPointer: [boolean, boolean, boolean, boolean],
        private subscriberClasses: number[],
    ) {}

    getIMM(): IMM {
        return this.imm;
    }

    getWT(): number {
        return this.wt;
    }   

    getNU(): number {
        return this.nu;
    }

    getFrameLengthFactor(): number {
        return this.frameLengthFactor;
    }

    getTimeslotPointer(): [boolean, boolean, boolean, boolean] {
        return this.timeslotPointer;
    }

    getSubscriberClasses(): number[] {
        return this.subscriberClasses;
    }

    /**
     * Checks if this access code is valid for the given timeslot index and subscriber class.
     * The timeslot index must be included in the timeslot pointer, and at least one subscriber class must be included in the access code subscriber classes.
     */
    public isValid(timeslotIndex: number, subscriberClasses: number[]): boolean {
        
        if (timeslotIndex < 0 || timeslotIndex >= this.timeslotPointer.length) {
            throw new Error(`Invalid timeslot index: ${timeslotIndex}`);
        }
        
        if (!this.timeslotPointer[timeslotIndex]) {
            return false;
        }
        
        return subscriberClasses.some(subscriberClass => this.subscriberClasses.includes(subscriberClass));
    }
}
