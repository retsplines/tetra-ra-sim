<script setup lang="ts">

import BaseFrameLength from './BaseFrameLength.vue';
import { Sim }  from './sim/sim';

defineProps<{
    sim: Sim
}>();

</script>

<template>

<div>
    <div class="parameter">
        <label title="The pattern of access codes to be used in the simulation. Subslots will be allocated access codes in a round-robin manner according to this pattern.">
            Access Code Pattern
            <input type="text" pattern="[A-D]+" v-model="sim.accessCodePattern" />
        </label>
    </div>
    <div class="parameter">
        <label title="The base frame length for the next subslot.">
            Base Frame-Length
            <BaseFrameLength v-model="sim.baseFrameLength"></BaseFrameLength>
        </label>
    </div>
    <div class="parameter">
        <label title="Automatically Ack any attempts that have no collisions.">
            Auto-Ack if no collision?
            <input type="checkbox" v-model="sim.autoAckIfNoCollision" />
        </label>
    </div>  
    <div class="parameter">
        <label title="Automatically request a transmission for any MS that is effectively idle.">
            Auto-RTT if idle?
            <input type="checkbox" v-model="sim.autoRequestIfIdle" />
        </label>
    </div>  
    <div class="parameter">
        <label title="Skip over slots that are not used by any access code.">
            Skip over irrelevant slots?
            <input type="checkbox" v-model="sim.skipIrrelevantSlots" />
        </label>
    </div>
    <div class="parameter">
        <label title="Hide slots that have no activity.">
            Hide unused slots?
            <input type="checkbox" v-model="sim.muteUnusedSlots" />
        </label>
    </div>
</div>

</template>

<style lang="scss" scoped>

.parameter {

    margin-bottom: 10px;

    label {
        input[type="text"] {
            width: 100px;
        }
    }

}

</style>
