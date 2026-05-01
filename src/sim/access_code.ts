import type { IMM } from "./imm";

export const ALL_SUBSCRIBER_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

/**
 * An access code 
 */
export class AccessCode {

    constructor(
        public imm: IMM,
        public wt: number,
        public nu: number,
        public frameLengthFactor: number,
        public timeslotPointer: [boolean, boolean, boolean, boolean],
        public subscriberClasses: number[] = ALL_SUBSCRIBER_CLASSES,
    ) {}

    /**
     * Get the "letter" name of an access code based on index.
     */
    public static getName(index: number): string {
        if (index < 0) {
            throw new Error(`Invalid access code index: ${index}`);
        }
        return String.fromCharCode(65 + index);
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
