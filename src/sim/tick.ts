import type { AccessCode } from "./access_code";
import type { MS } from "./ms";
import type { TDMATime } from "./time";

/**
 * Possible outcome for a tick for an MS.
 */
export abstract class TickEvent {
    constructor(public who: MS) {}
}

/**
 * A tick where an MS transmitted an access attempt.
 */
export class TickTransmitted extends TickEvent {
    constructor(
        public who: MS, 
        public subslot: 0 | 1, 
        public requestTime: TDMATime,
        public wasImmediate: boolean,
        public accessCodeUsed?: AccessCode,
        public accessFrameStarted?: {time: TDMATime, ssn: 0|1},
        public rolledSubslot?: number,
        public accessFrameLength?: number,
        public releaventTimes?: {time: TDMATime, ssn: 0|1}[]
    ) {
        super(who);
    }
}

/**
 * A tick where an MS received a response to an access attempt.
 */
export class TickReceivedResponse extends TickEvent {
    constructor(public who: MS, public slotsBetweenRequestAndResponse: number) {
        super(who);
    }
}

/**
 * A tick where an MS aborted after retrying the maximum number of times (Nu).
 */
export class TickAborted extends TickEvent {
}
