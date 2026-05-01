/**
 * Possible outcome for a tick for an MS.
 */
export abstract class Tick {
}

/**
 * A tick where an MS transmitted an access attempt.
 */
export class TickTransmitted extends Tick {
    constructor(public subslotIndex: number) {
        super();
    }
}

/**
 * A tick where an MS did nothing.
 */
export class TickIdle extends Tick {
}

/**
 * A tick where an MS was waiting for an opportunity to transmit (IMM)
 */
export class TickWaitForOpportunity extends Tick {
    constructor(public waited: number) {
        super();
    }
}

/**
 * A tick where an MS was waiting for a response to an access attempt (WT)
 */
export class TickWaitForResponse extends Tick {
    constructor(public waited: number) {
        super();
    }
}

/**
 * A tick where an MS has selected a subslot within an access frame and is waiting for it to arrive.
 */
export class TickRandomisingWithinAccessFrame extends Tick {
    constructor(public waited: number) {
        super();
    }
}

/**
 * A tick where an MS is waiting for an access frame to start.
 */
export class TickWaitingForAccessFrame extends Tick {
    constructor(public waited: number) {
        super();
    }
}

/**
 * A tick where an MS aborted after retrying the maximum number of times (Nu).
 */
export class TickAborted extends Tick {
}
