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
                {{ mobileStation.getStateDescription() }}
            </div>

            <div class="substate">
                <div>Attempts left {{ mobileStation.attemptsLeft }}</div>
                <div>IMM slots left {{ mobileStation.immSlotsLeft }}</div>
                <div>WT opportunities left {{ mobileStation.wtOpportunities }}</div>
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
            <button v-if="mobileStation.getState() == State.Idle" @click="mobileStation.requestMessage()" title="Request to Transmit">RTT</button>
            <button v-if="mobileStation.getState() == State.WaitingForResponse" @click="mobileStation.provideResponse()" title="Acknowledge">Ack!</button>
            <button v-if="mobileStation.getState() == State.Succeeded || mobileStation.getState() == State.GivenUp" @click="mobileStation.reset()">Reset</button>
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
