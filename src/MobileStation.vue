<script setup lang="ts">
import { MS, State } from './sim/ms';
import { AccessCode } from './sim/access_code';

const AC = AccessCode;

const MSState = State;

defineProps<{
    id: number,
    mobileStation: MS
}>()

</script>

<template>
    <div class="ms">
        <div class="issi">{{ mobileStation.issi }}</div>
        <div class="properties">

            <div class="state">
                <span v-if="mobileStation.getState() === MSState.Idle">Idle</span>
                <span v-else-if="mobileStation.getState() === MSState.HasMessageToSend">Waiting for Opportunity</span>
                <span v-else-if="mobileStation.getState() === MSState.WaitingForAccessFrame">Waiting for Access Frame</span>
                <span v-else-if="mobileStation.getState() === MSState.WaitingForRandomSubslotWithinAccessFrame">Waiting for Random Subslot</span>
                <span v-else-if="mobileStation.getState() === MSState.GivenUp">Given Up</span>
                <span v-else-if="mobileStation.getState() === MSState.Succeeded">Succeeded</span>
            </div>

            <div class="access-codes">
                Access Code <select v-model="mobileStation.accessCode">
                    <option v-for="(accessCode, index) in mobileStation.sim.getAccessCodes()" :value="accessCode">
                        {{ AC.getName(index) }}
                    </option>
                </select>
            </div>
            
        </div>
        <div class="actions">
            <button @click="mobileStation.requestMessage()">Req. Msg</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>

.ms {
    display: flex;
    align-items: center;
    gap: 20px;

    .issi {
        font-weight: bold;
        font-size: 1.5em;
        vertical-align: top;
        align-self: flex-start;
    }

    .state {
        font-weight: bold;
    }

    .properties {
        flex-grow: 1;
    }

    :not(:last-child)   {
        margin-bottom: 10px;
    }

}

</style>
