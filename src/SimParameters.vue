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
        <label>
            Access Code Pattern
            <input type="text" pattern="[A-D]+" v-model="sim.accessCodePattern" />
        </label>
    </div>
    <div class="parameter">
        <label>
            Base Frame-Length
            <BaseFrameLength v-model="sim.baseFrameLength"></BaseFrameLength>
        </label>
    </div>
    <div class="parameter">
        <label>
            Auto-Ack if no collision?
            <input type="checkbox" v-model="sim.autoAckIfNoCollision" />
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
