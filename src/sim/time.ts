
export const SUBSLOTS_PER_SLOT = 2;
export const SLOTS_PER_FRAME = 4;
export const FRAMES_PER_MULTIFRAME = 18;

/**
 * A TDMA timestamp.
 */
export class TDMATime {

    private multiframe = 0;
    private frame = 0
    private slot = 0;
    private subslot = 0;

    constructor(multiframe: number, frame: number, slot: number, subslot: number) {
        this.multiframe = multiframe;
        this.frame = frame;
        this.slot = slot;
        this.subslot = subslot;
    }

    /**
     * Advance the timestamp by one subslot.
     */
    public tick() {
        
        this.subslot ++;

        if (this.subslot >= SUBSLOTS_PER_SLOT) {
            this.subslot = 0;
            this.slot ++;

            if (this.slot >= SLOTS_PER_FRAME) {
                this.slot = 0;
                this.frame ++;

                if (this.frame >= FRAMES_PER_MULTIFRAME) {
                    this.frame = 0;
                    this.multiframe ++;
                }
            }
        }
    }   

    /**
     * Returns the timestamp as a count of subslots.
     */
    public timestamp() {
        return this.multiframe * FRAMES_PER_MULTIFRAME * SLOTS_PER_FRAME * SUBSLOTS_PER_SLOT +
            this.frame * SLOTS_PER_FRAME * SUBSLOTS_PER_SLOT +
            this.slot * SUBSLOTS_PER_SLOT +
            this.subslot;
    }
}