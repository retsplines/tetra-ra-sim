import type { AccessCode } from './access_code.ts';
import { MS } from './ms.ts';
import { TDMATime } from './time.ts';

export class Sim {

    private population: MS[] = [];

    private accessCodes: AccessCode[] = [];

    private time: TDMATime = new TDMATime();

    constructor(
        populationSize: number
    ) {

    }

    public tick() {
        this.time.tick();
    }

    public getTime() {
        return this.time;
    }
}