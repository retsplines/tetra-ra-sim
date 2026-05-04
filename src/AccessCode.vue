<script setup lang="ts">

import { AccessCode } from './sim/access_code';
import TimeslotPointer from './TimeslotPointer.vue';

// Allow AccessCode to be used statically in the template
const AC = AccessCode;

const props = defineProps<{
    id: number,
    accessCode: AccessCode
}>()

</script>

<template>
    <div class="access-code" v-bind:class="{'disabled': accessCode.nu == 0}">
        <span class="id" v-bind:class="'access-code-' + AC.getName(props.id)">{{ AC.getName(props.id) }}</span>
            <label title="The number of frames to wait for an opportunity on first-try before randomising. A value of 0 means always bypass the first-try procedure. A value of 15 means always use the first-try procedure.">
                IMM
                <span v-if="accessCode.imm == 15">(Imm)</span>
                <span v-if="accessCode.imm == 0">(AR)</span>
                <input type="number" min="0" max="15" step="1" v-model="accessCode.imm">
            </label>
            <label title="The number of downlink signalling opportunities to wait for a response after making an access attempt.">
                WT
                <input type="number" min="0" max="15" step="1" v-model="accessCode.wt">
            </label>
            <label title="The number of attempts allowed per message.">
                Nu
                <span v-if="accessCode.nu == 0">(OFF)</span>
                <input type="number" min="0" max="15" step="1" v-model="accessCode.nu">
            </label>
            <label title="Whether a 4x access frame length multiplier should be applied.">
                x4 FL
                <input type="checkbox" v-model="accessCode.frameLengthFactor">
            </label>
            <label title="The uplink timeslots for which this access code is applicable.">
                TS Ptr
                <TimeslotPointer v-model="accessCode.timeslotPointer"></TimeslotPointer>
            </label>
    </div>
</template>

<style lang="scss" scoped>

.access-code {

    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 10px;

    .id {
        font-weight: bold;
        font-size: 1.5em;
        background-color: transparent !important;
    }

    label {
        font-size: 0.8em;
        width: 25%;

        input[type="number"] {
            width: 50px;
        }
    }

    &.disabled {
        opacity: 0.3;
    }

}

</style>
