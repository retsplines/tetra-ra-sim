import { AccessCode, ALL_SUBSCRIBER_CLASSES } from './access_code.ts';
import { AccessField } from './access_field.ts';
import { BaseFrameLength } from './base_frame_length.ts';
import { IMM } from './imm.ts';
import { MS } from './ms.ts';
import { TickEvent } from './tick.ts';
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

    /**
     * Advance the simulation by one tick, returning any events that occur during that tick.
     */
    public tick(): TickEvent[] {
        
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

        this.time.tick();
        let events = [];

        console.log(`Tick ${this.time.toString()}: SSN1 Access Code ${AccessCode.getName(subslot1AccessCodeIndex)}, SSN2 Access Code ${AccessCode.getName(subslot2AccessCodeIndex)}`);

        for (const ms of this.population) {
            let msEventOrNull = ms.tick(this.time, [accessField1, accessField2]);
            if (msEventOrNull instanceof TickEvent) {
                events.push(msEventOrNull);
            }
        }
        
        return events;
    }

    /**
     * Reset the simulation to its initial state.
     */
    public reset() {
        this.time = new TDMATime();
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