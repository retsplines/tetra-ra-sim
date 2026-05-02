/**
 * Possible outcome for a tick for an MS.
 */
export abstract class TickEvent {
}

/**
 * A tick where an MS transmitted an access attempt.
 */
export class TickTransmitted extends TickEvent {
    constructor(public subslot: 0 | 1) {
        super();
    }
}

/**
 * A tick where an MS aborted after retrying the maximum number of times (Nu).
 */
export class TickAborted extends TickEvent {
}
