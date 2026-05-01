<script setup lang="ts">

const model = defineModel();

</script>

<template>
    <select v-model="model">
        <option value="0">Reserved subslot</option>
        <option value="1">CLCH subslot</option>
        <option value="2">Ongoing frame</option>
        <option value="3">Marker - 1 subslot</option>
        <option value="4">Marker - 2 subslots</option>
        <option value="5">Marker - 3 subslots</option>
        <option value="6">Marker - 4 subslots</option>
        <option value="7">Marker - 5 subslots</option>
        <option value="8">Marker - 6 subslots</option>
        <option value="9">Marker - 8 subslots</option>
        <option value="10">Marker - 10 subslots</option>
        <option value="11">Marker - 12 subslots</option>
        <option value="12">Marker - 16 subslots</option>
        <option value="13">Marker - 20 subslots</option>
        <option value="14">Marker - 24 subslots</option>
        <option value="15">Marker - 32 subslots</option>
    </select>
</template>

<style lang="scss" scoped>

// No wrapping of the checkboxes
.timeslot-pointer {
    display: flex;
    flex-direction: row;
    gap: 5px;
}
</style>
