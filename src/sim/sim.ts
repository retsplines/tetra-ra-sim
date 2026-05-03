import { AccessCode, ALL_SUBSCRIBER_CLASSES } from './access_code.ts';
import { AccessField } from './access_field.ts';
import { BaseFrameLength } from './base_frame_length.ts';
import { IMM } from './imm.ts';
import { MS, State } from './ms.ts';
import { SlotLog } from './slot_log.ts';
import { TickEvent, TickReceivedResponse, TickTransmitted } from './tick.ts';
import { TDMATime } from './time.ts';

export class Sim {

    /**
     * The population of MSs in the simulation.
     */
    private population: MS[] = [];

    /**
     * The pattern of access codes to use.
     * The pattern repeats indefinitely across subslots. 
     * 
     * Just "A" means every subslot uses Access Code A.
     * "AB" would mean that every subslot 1 uses Access Code A, every subslot 2 uses Access Code B.
     * "AABBCCDD" would mean slots 1-4 use Access Code A-D respectively.
     */
    public accessCodePattern = "A";

    /**
     * The base frame length to use in the simulation for new slots.
     */
    public baseFrameLength: BaseFrameLength = BaseFrameLength.Subslot4;

    /**
     * Whether to automatically acknowledge an MS's transmission if it is the only one to transmit in that subslot (i.e. no collision occurs).
     */
    public autoAckIfNoCollision = true;

    /**
     * Whether to automatically request access for an MS if it is idle.
     */
    public autoRequestIfIdle = false;

    /**
     * Whether to fast-forward time over slots that have no relevance in the RA protocol
     * These slots are defined as slots where no access code TS Ptr indicates validity for that slot.
     */
    public skipIrrelevantSlots = true;

    /**
     * Whether to mute unused slots.
     */
    public muteUnusedSlots = true;

    /**
     * Statistics for the simulation.x
     */
    public totalAttempts = 0;
    public totalSuccesses = 0
    public totalCollisions = 0;

    /**
     * Access Codes that are registered within the simulation.
     * There are always 4, but some may be disabled (Nu = 0).
     */
    private accessCodes: [AccessCode, AccessCode, AccessCode, AccessCode] = [

        new AccessCode(
            IMM.Immediate,
            3,
            3,
            false,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),

        new AccessCode(
            IMM.Immediate,
            0,
            0,
            false,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),

        new AccessCode(
            IMM.Immediate,
            0,
            0,
            false,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),

        new AccessCode(
            IMM.Immediate,
            0,
            0,
            false,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),
    ];

    /**
     * The current time in the simulation, represented as a TDMA timestamp.
     */
    private time: TDMATime = new TDMATime();

    constructor() {}

    /**
     * Add an MS
     */
    public addMS(ms: MS){
        this.population.push(ms);
    }

    private slotIsRelevant(time: TDMATime): boolean {
        // Slots for which no access codes timeslot pointers point to are irrelevant
        for (const accessCode of this.accessCodes) {
            if (accessCode.timeslotPointer[time.getSlot() - 1]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Advance the simulation by one tick, returning any events that occur during that tick.
     */
    public tick(): SlotLog {
        
        // Determine which access code will be used for the two subslots
        let timestamp = this.time.toTimestamp();
        
        // Convert the access code pattern into indexes
        let patternIndexes = this.accessCodePattern.split("").map(char => char.charCodeAt(0) - "A".charCodeAt(0));

        // Determine the access codes for the two subslots based on the pattern and the current timestamp
        let subslot1AccessCodeIndex = patternIndexes[(timestamp * 2) % patternIndexes.length]!;
        let subslot2AccessCodeIndex = patternIndexes[(timestamp * 2 + 1) % patternIndexes.length]!;
        let subslot1AccessCode = this.accessCodes[subslot1AccessCodeIndex]!;
        let subslot2AccessCode = this.accessCodes[subslot2AccessCodeIndex]!;
        
        // Build the two access fields
        let accessField1 = new AccessField(subslot1AccessCode, this.baseFrameLength);
        let accessField2 = new AccessField(subslot2AccessCode, this.baseFrameLength);

        // Set the base frame length to "CLCH" for both slots if the slot is reserved for CLCH
        if (this.time.isCLCH()) {
            accessField1.baseFrameLength = BaseFrameLength.CLCHSubslot;
            accessField2.baseFrameLength = BaseFrameLength.CLCHSubslot;
        }

        let slotLog = new SlotLog(this.time.clone(), [accessField1, accessField2]);

        console.log(`Tick ${this.time.toString()}: SSN1 Access Code ${AccessCode.getName(subslot1AccessCodeIndex)}, SSN2 Access Code ${AccessCode.getName(subslot2AccessCodeIndex)}`);
        for (const ms of this.population) {

            // If autoRequestIfIdle is enabled and the MS is idle, set the MS to have a request
            if (this.autoRequestIfIdle && ms.isEffectivelyIdle()) {
                ms.requestMessage();
                console.log(`Auto-requesting access for MS ${ms.issi} since it is idle`);
            }

            let msEventOrNull = ms.tick(this.time, [accessField1, accessField2]);
            if (msEventOrNull instanceof TickEvent) {
                slotLog.pushEvent(msEventOrNull);

                if (msEventOrNull instanceof TickTransmitted) {
                    this.totalAttempts++;
                }

                if (msEventOrNull instanceof TickReceivedResponse) {
                    this.totalSuccesses++;
                }
            }
        }

        for (const ssn of [0, 1]) {
            if (slotLog.subslotTransmissions[ssn]!.length == 1) {
                if (this.autoAckIfNoCollision) {
                    // If there was exactly 1 transmission in subslot 1, acknowledge it
                    slotLog.subslotTransmissions[ssn]![0]!.who.provideResponse();
                    console.log(`Auto-acknowledging MS ${slotLog.subslotTransmissions[ssn]![0]!.who.issi} in subslot ${ssn + 1}`);
                }
            } else if (slotLog.subslotTransmissions[ssn]!.length > 1) {
                // Increment total collisions if there was more than 1 transmission (i.e. a collision)
                this.totalCollisions++;
            }
        }

        // Advance time
        this.time.tick();

        // Advance time further if skipIrrelevantSlots is enabled and the next slot is irrelevant
        if (this.skipIrrelevantSlots) {
            while (!this.slotIsRelevant(this.time)) {
                console.log(`Skipping irrelevant slot ${this.time.toString()}`);
                this.time.tick();
            }
        }

        if (
            this.muteUnusedSlots && 
            slotLog.subslotTransmissions[0]!.length == 0 && 
            slotLog.subslotTransmissions[1]!.length == 0 &&
            slotLog.receptions.length == 0
        ) {
            console.log(`Muting unused slot ${slotLog.time.toString()} there were no transmissions in either subslot`);
            slotLog.muted = true;
        }
        
        return slotLog;
    }

    /**
     * Reset the simulation to its initial state.
     */
    public reset() {
        this.time = new TDMATime();

        // Reset all MS
        for (const ms of this.population) {
            ms.reset();
        }

        // Reset statistics
        this.totalAttempts = 0;
        this.totalSuccesses = 0;
        this.totalCollisions = 0;
    }

    public getTime(): TDMATime {
        return this.time;
    }

    public getAccessCodes(): [AccessCode, AccessCode, AccessCode, AccessCode] {
        return this.accessCodes;
    }

    public getMobileStations(): MS[] {
        return this.population;
    }
}