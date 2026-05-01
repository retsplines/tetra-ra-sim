export const SLOTS_PER_FRAME = 4;
export const FRAMES_PER_MULTIFRAME = 18;

/**
 * A TDMA timestamp.
 */
export class TDMATime {

    private slot: number;
    private frame: number;
    private multiframe: number;

    public constructor(
        slot: number = 1,
        frame: number = 1,
        multiframe: number = 1
    ) {
        TDMATime.assertRange(slot, 1, SLOTS_PER_FRAME, "slot");
        TDMATime.assertRange(frame, 1, FRAMES_PER_MULTIFRAME, "frame");

        this.slot = slot;
        this.frame = frame;
        this.multiframe = multiframe;
    }

    public tick(): void {
        this.slot++;

        if (this.slot > SLOTS_PER_FRAME) {
            this.slot = 1;
            this.frame++;

            if (this.frame > FRAMES_PER_MULTIFRAME) {
                this.frame = 1;
                this.multiframe++;
            }
        }
    }

    public toTimestamp(): number {
        return (
            ((((this.multiframe - 1) * FRAMES_PER_MULTIFRAME) + (this.frame - 1)) * SLOTS_PER_FRAME + (this.slot - 1))
        );
    }

    public static fromTimestamp(timestamp: number): TDMATime {
        if (!Number.isInteger(timestamp) || timestamp < 0) {
            throw new RangeError("timestamp must be a non-negative integer");
        }

        const slotsPerCycle =
            SLOTS_PER_FRAME *
            FRAMES_PER_MULTIFRAME;

        // Wrap the timestamp to the current cycle (multiframe)
        // We ignore the existence of multiframes here since the simulation won't run that long
        let remaining = timestamp % slotsPerCycle;

        const multiframe = Math.floor(remaining / (SLOTS_PER_FRAME * FRAMES_PER_MULTIFRAME)) + 1;
        remaining %= SLOTS_PER_FRAME * FRAMES_PER_MULTIFRAME;

        const frame = Math.floor(remaining / (SLOTS_PER_FRAME)) + 1;
        remaining %= SLOTS_PER_FRAME;

        return new TDMATime(remaining, frame, multiframe);
    }

    private static assertRange(value: number, min: number, max: number, name: string): void {
        if (!Number.isInteger(value) || value < min || value > max) {
            throw new RangeError(`${name} must be an integer in range ${min}-${max}`);
        }
    }

    public getSlot(): number {
        return this.slot;
    }

    public getFrame(): number {
        return this.frame;
    }

    public getMultiframe(): number {
        return this.multiframe;
    }

    /**
     * Returns true if this time corresponds to a CLCH reserved slot.
     */
    public isCLCH(): boolean {
        return this.frame === 18 && this.slot === (4 - ((this.multiframe + 1) % 4));
    }

    public isControlFrame(): boolean {
        return this.frame === 18;
    }
}