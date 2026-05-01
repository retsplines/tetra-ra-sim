import type { AccessCode } from "./access_code";
import type { BaseFrameLength } from "./base_frame_length";

export class AccessField {
    constructor(
        public accessCode: AccessCode,
        public baseFrameLength: BaseFrameLength
    ) {}
}
