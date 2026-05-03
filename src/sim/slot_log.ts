import type { AccessField } from "./access_field";
import type { MS } from "./ms";
import { TickReceivedResponse, TickTransmitted, type TickEvent } from "./tick";
import type { TDMATime } from "./time";

// TODO: Needs to also capture the access code used for each subslot, so we can display that in the logs
export class SlotLog {

    private events: TickEvent[] = [];
    public subslotTransmissions: [TickTransmitted[], TickTransmitted[]] = [[], []];
    public receptions: TickReceivedResponse[] = [];
    public muted = false;

    constructor(public time: TDMATime, public accessFields: [AccessField, AccessField]) {
    }

    public pushEvent(event: TickEvent) {

        // Log the event
        this.events.push(event);

        if (event instanceof TickTransmitted) {

            // Add the MS to the list of transmissions for the relevant subslot
            this.subslotTransmissions[event.subslot].push(event);
            
        }

        if (event instanceof TickReceivedResponse) {
            // Add the MS to the list of receptions
            this.receptions.push(event);
        }
    }
    
}
