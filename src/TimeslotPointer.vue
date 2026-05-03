<script setup lang="ts">

const model = defineModel<[boolean, boolean, boolean, boolean]>();

</script>

<template>
    <div class="timeslot-pointer">
        <input type="checkbox" v-model="model![0]">
        <input type="checkbox" v-model="model![1]">
        <input type="checkbox" v-model="model![2]">
        <input type="checkbox" v-model="model![3]">
    </div>
</template>

<style lang="scss" scoped>

// No wrapping of the checkboxes
.timeslot-pointer {
    display: flex;
    flex-direction: row;
    gap: 5px;
}
</style>
