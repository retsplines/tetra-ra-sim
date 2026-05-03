<template>

    <div class="sidebar">
        <div class="title">
            <h1>TETRA Random Access Sim</h1>
        </div>

        <div class="section">
            <div class="heading">Control</div>
            <div class="body">
                <div class="time">
                    {{ sim.getTime().toString() }}
                </div>
                <div class="controls">
                    <button v-bind:disabled="autorun" @click="tick()">Single</button>
                    <button @click="toggleAutorun()">{{  autorun ? 'Stop' : 'Run' }}</button>
                    <select v-bind:disabled="autorun" v-model="tickTime">
                        <option value="420">30x Speed</option>
                        <option value="210">60x Speed</option>
                        <option value="84">100x Speed</option>
                    </select>
                    <button v-bind:disabled="autorun" @click="reset()">Reset</button>
                </div>
            </div>      
        </div>

        <div class="section">
            <div class="heading">Statistics</div>
            <div class="body">
                <div>Attempts: {{ sim.totalAttempts }}</div>
                <div v-if="sim.totalAttempts > 0">
                    Successes: {{ sim.totalSuccesses }} 
                    ({{ Math.round(sim.totalSuccesses / sim.totalAttempts * 100) }}%)
                </div>
                <div v-if="sim.totalAttempts > 0">
                    Collisions: {{ sim.totalCollisions }} 
                    ({{ Math.round(sim.totalCollisions / sim.totalAttempts * 100) }}%)
                </div>
            </div>      
        </div>

        <div class="section">
            <div class="heading">Simulation Parameters</div>
            <div class="body">
                <SimParameters :sim="sim"></SimParameters>
            </div>
        </div>

        <div class="section">
            <div class="heading">Access Codes</div>
            <div class="body">
                <AccessCode v-for="(accessCode, index) in sim.getAccessCodes()" :access-code="accessCode" :id="index"></AccessCode>
            </div>
        </div>
        
        <div class="section">
            <div class="heading">
                MS Population
                <button @click="addMS()">Add MS</button>
                <button @click="requestAll()">RTT All</button>
            </div>
            <div class="body">
                <MobileStation v-for="(mobileStation, index) in sim.getMobileStations()" :mobile-station="mobileStation" :id="index"></MobileStation>
            </div>      
        </div>

    </div>

    <div class="main">
        <div class="log">
            <Slot 
                v-bind:class="slotLog.time.toClassName()"
                v-for="(slotLog, index) in slotLogs"
                v-show="!slotLog.muted"
                :slot-log="slotLog"
                :sim="sim" 
                :id="index">{{ slotLog.muted }}
            </Slot>
        </div>
        <span ref="endOfLog"></span>
    </div>

</template>

<script setup lang="ts">

import { ref } from 'vue';
import { Sim }  from './sim/sim';
import { MS }  from './sim/ms';
import AccessCode from './AccessCode.vue';
import MobileStation from './MobileStation.vue';
import SimParameters from './SimParameters.vue';
import Slot from './Slot.vue';
import type { SlotLog } from './sim/slot_log';
import type { TDMATime } from './sim/time';

const sim = ref<Sim>(new Sim());

// 1 frame = 56ms
// 1 slot = 14ms
let intervalId: number | null = null;
const autorun = ref(false);
const tickTime = ref(210);   
const slotLogs = ref<SlotLog[]>([]);
const hideIrrelevantSlots = ref(true);

// Scroll to the end of the log whenever a new slot is added
const endOfLog = ref<HTMLElement | null>(null); 

/**
 * Request to transmit for all effectively idle MS instances.
 */
function requestAll() {
    sim.value.getMobileStations().forEach(ms => {
        if (ms.isEffectivelyIdle()) {
            ms.requestMessage();
        }
    });
}

/**
 * Add an MS to the simulation, by default using Access Code A.
 */
function addMS() {
    // Generate an incremental ISSI based on 1024 + the current number of MS instances
    const issi = 1024 + sim.value.getMobileStations().length;
    const ms = new MS(issi, sim.value.getAccessCodes()[0], sim.value);
    sim.value.addMS(ms);
}

/**
 * Toggle autorun on/off.
 */
function toggleAutorun() {

    autorun.value = !autorun.value;
    if (autorun.value) {
        intervalId = setInterval(() => {
            tick();
        }, tickTime.value);
    } else {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

}

/**
 * Advance the simulation by one tick, and log any events that occur.
 */
function tick() {
    const log = sim.value.tick();

    slotLogs.value.push(log);
    if (endOfLog.value) {
        endOfLog.value.scrollIntoView({ behavior: 'smooth' });
    }
}

function reset() {
    sim.value.reset();
    slotLogs.value = [];
    autorun.value = false;
}

// Add an MS to start
addMS();

</script>

<style lang="scss" scoped>

.sidebar {
    width: 500px;
    height: 100vh;
    background-color: #f0f0f0;
    float: left;
    overflow-y: scroll;

    .title {
        padding: 10px;
        background-color: #e0e0e0;
        text-align: center;
        font-size: 0.6em;
    }

    .section {
        background-color: #dedede;
        .heading {
            font-weight: bold;
            margin-bottom: 5px;
            padding: 10px;
            background-color: #d0d0d0;
        }
        .body {
            padding: 10px;
        }
    }
}

.controls {
    display: flex;
    gap: 10px;
    margin-top: 10px;

    button {
        flex-grow: 1;
    }
}

.time {
    font-size: 1.4em;
    font-weight: bold;
}

.main {
    overflow-y: scroll;
    height: 100vh;
    background-color: #ffffff;

    .log {
        display: flex;
        flex-direction: row;
        flex: 1;
        gap: 5px;
        padding: 5px;
        // wrap
        flex-wrap: wrap;
        // align items to the top
        align-items: flex-start;
        // justify content to the start
        justify-content: flex-start;
    }
}

</style>
