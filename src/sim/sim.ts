import { AccessCode, ALL_SUBSCRIBER_CLASSES } from './access_code.ts';
import { IMM } from './imm.ts';
import { MS } from './ms.ts';
import type { Tick } from './tick.ts';
import { TDMATime } from './time.ts';

export class Sim {

    /**
     * The population of MSs in the simulation.
     */
    private population: MS[] = [];

    /**
     * Access Codes that are registered within the simulation.
     * There are always 4, but some may be disabled (Nu = 0).
     */
    private accessCodes: [AccessCode, AccessCode, AccessCode, AccessCode] = [

        new AccessCode(
            IMM.Immediate,
            5,
            5,
            1,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),

        new AccessCode(
            IMM.Immediate,
            0,
            0,
            1,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),

        new AccessCode(
            IMM.Immediate,
            0,
            0,
            1,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),

        new AccessCode(
            IMM.Immediate,
            0,
            0,
            1,
            [true, false, false, false],
            ALL_SUBSCRIBER_CLASSES
        ),
    ];

    /**
     * The current time in the simulation, represented as a TDMA timestamp.
     */
    private time: TDMATime = new TDMATime();

    constructor() {
    }

    /**
     * Add an MS
     */
    public addMS(ms: MS){
        this.population.push(ms);
    }

    /**
     * Advance the simulation by one tick, returning any events that occur during that tick.
     */
    public tick(): Tick[] {
        
        this.time.tick();
        let events = [];

        for (const ms of this.population) {
            events.push(ms.tick(this.time));
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