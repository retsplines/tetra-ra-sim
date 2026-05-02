<script setup lang="ts">
import { BaseFrameLength, getBaseFrameLengthName, getSubslotCount } from './sim/base_frame_length';

const model = defineModel<BaseFrameLength>();

const BaseFrameLengthOptions = Object.values(BaseFrameLength).filter(value => typeof value === 'number') as BaseFrameLength[];

</script>

<template>
    <select v-model="model">
        <option v-for="(baseFrameLength, index) in BaseFrameLengthOptions" :value="baseFrameLength">
            {{ getBaseFrameLengthName(baseFrameLength) }}
        </option>
    </select>
</template>

<style lang="scss" scoped>
.timeslot-pointer {
    display: flex;
    flex-direction: row;
    gap: 5px;
}
</style>
