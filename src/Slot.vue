<script setup lang="ts">
import { AccessCode } from './sim/access_code';
import { BaseFrameLength, getBaseFrameLengthName } from './sim/base_frame_length';
import type { Sim } from './sim/sim';
import type { SlotLog } from './sim/slot_log';

const props = defineProps<{
    slotLog: SlotLog,
    sim: Sim
}>();

function getAccessCodeName(accessCode: AccessCode): string {
    return AccessCode.getName(props.sim.getAccessCodes().indexOf(accessCode));
}   

</script>

<template>
    <div class="slot">
        <div class="time">
            {{ slotLog.time.toString() }}
        </div>
        <div class="subslots">
            <div v-for="n in 2" class="subslot" v-bind:class="{'transmit': slotLog.subslotTransmissions[n - 1]!.length > 0, 'collision': slotLog.subslotTransmissions[n - 1]!.length > 1}">
                <div class="subslot-heading" v-bind:title="'Subslot used Access Code ' + getAccessCodeName(slotLog.accessFields[n - 1]!.accessCode)" v-bind:class="'access-code-' + getAccessCodeName(slotLog.accessFields[n - 1]!.accessCode)">
                    {{ getAccessCodeName(slotLog.accessFields[n - 1]!.accessCode) }}
                </div>
                <div class="subslot-heading" v-bind:title="'Subslot used Base Frame-Length ' + getBaseFrameLengthName(slotLog.accessFields[n - 1]!.baseFrameLength)">
                    {{ getBaseFrameLengthName(slotLog.accessFields[n - 1]!.baseFrameLength, true) }}
                </div>
                <div v-for="ms in slotLog.subslotTransmissions[n - 1]!" class="tx">
                    {{ ms.issi }}?
                </div>
                <div v-if="n == 1" v-for="ms in slotLog.receptions" class="rx">
                    {{ ms.issi }}!
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

.slot {
    width: 140px;
    height: 140px;
    background-color: #ccc;
    display: flex;
    flex-direction: column;

    .time {
        background-color: #bbb;
        text-align: center;
        padding: 2px;
    }
    
    .subslots {
        display: flex;
        flex-direction: row;
        height: 100%;
        
        .subslot {
            flex-grow: 1;
            width: 50%;

            .subslot-heading {
                background-color: #c5c5c5;
                text-align: center;
                padding: 2px;
                font-size: 0.8em;
            }

            .tx {
                border: 1px solid #999;
                margin: 2px;
                padding: 2px;
                background-color: rgb(193, 234, 255);
            }

            .rx {
                border: 1px solid #999;
                margin: 2px;
                padding: 2px;
                background-color: rgb(193, 255, 193);
            }

            &:first-child {
                border-right: 1px solid #999;
            }

            &.transmit {
                background-color: #d0e5d1;
            }

            &.collision {
                background-color: #d88282;
            }
        }
    }
}

</style>
