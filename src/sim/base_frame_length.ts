export enum BaseFrameLength {
    ReservedSubslot = 0,
    CLCHSubslot = 1,
    OngoingFrame = 2,
    Subslot1 = 3,
    Subslot2 = 4,
    Subslot3 = 5,
    Subslot4 = 6,
    Subslot5 = 7,
    Subslot6 = 8,
    Subslot8 = 9,
    Subslot10 = 10,
    Subslot12 = 11,
    Subslot16 = 12,
    Subslot20 = 13,
    Subslot24 = 14,
    Subslot32 = 15

}

export function getBaseFrameLengthName(baseFrameLength: BaseFrameLength): string {
    switch (baseFrameLength) {
        case BaseFrameLength.ReservedSubslot:
            return "Reserved Subslot";
        case BaseFrameLength.CLCHSubslot:
            return "CLCH Subslot";
        case BaseFrameLength.OngoingFrame:
            return "Ongoing Frame";
        default:
            return `Marker - Subslots (${getSubslotCount(baseFrameLength)})`;
    }
}

export function getSubslotCount(baseFrameLength: BaseFrameLength): number {
    switch (baseFrameLength) {
        case BaseFrameLength.ReservedSubslot:
        case BaseFrameLength.CLCHSubslot:
        case BaseFrameLength.OngoingFrame:
            return 0;
        case BaseFrameLength.Subslot1:
            return 1;
        case BaseFrameLength.Subslot2:
            return 2;
        case BaseFrameLength.Subslot3:
            return 3;
        case BaseFrameLength.Subslot4:
            return 4;
        case BaseFrameLength.Subslot5:
            return 5;
        case BaseFrameLength.Subslot6:
            return 6;
        case BaseFrameLength.Subslot8:
            return 8;
        case BaseFrameLength.Subslot10:
            return 10;
        case BaseFrameLength.Subslot12:
            return 12;
        case BaseFrameLength.Subslot16:
            return 16;
        case BaseFrameLength.Subslot20:
            return 20;
        case BaseFrameLength.Subslot24:
            return 24;
        case BaseFrameLength.Subslot32:
            return 32;
    }
}   
