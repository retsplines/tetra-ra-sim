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
            <div class="heading">Inspected Attempt</div>
            <div class="body" v-if="inspectedAttempt">
                <div>ISSI {{ inspectedAttempt.who.issi }}</div>
                <div>RTT @ {{ inspectedAttempt.requestTime.toString() }}</div>
                <div v-if="inspectedAttempt.accessCodeUsed">
                    Used Access Code {{ AC.getName(sim.getAccessCodes().indexOf(inspectedAttempt.accessCodeUsed)) }}
                </div>
                <div v-if="!inspectedAttempt.wasImmediate">
                    <strong>Randomised access</strong><br />
                    Access Frame started at {{ inspectedAttempt.accessFrameStarted!.time.toString() }}, subslot {{ inspectedAttempt.accessFrameStarted!.ssn + 1 }}<br />
                    Access Frame length: {{ inspectedAttempt.accessFrameLength }} subslots<br />
                    Rolled subslot #{{ inspectedAttempt.rolledSubslot! + 1}}<br />
                </div>
                <div v-else>
                    <strong>Immediate access</strong>.
                </div>
            </div>
            <div class="body" v-else>
                Click on an attempt in the log to inspect it here.
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
                <div v-if="sim.totalAttempts > 0">
                    Average access delay: {{ getAverageAccessDelay() }} slots ({{ convertSlotsToSeconds(parseFloat(getAverageAccessDelay())) }} seconds)
                </div>
            </div>      
        </div>

        <div class="section">
            <div class="heading">Simulation Parameters</div>
            <div class="body">
                <SimParameters :sim="sim as Sim"></SimParameters>
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

    <div class="main" @click="inspectAttempt(null)">
        <div class="log">
            <Slot 
                v-bind:class="slotLog.time.toClassName()"
                v-for="(slotLog, index) in slotLogs"
                v-show="!slotLog.muted"
                :slot-log="slotLog as SlotLog"
                :sim="sim as Sim" 
                :id="index"
                :highlight-ssn1="inspectedAttempt?.releaventTimes?.some(t => t.time.toString() == slotLog.time.toString() && t.ssn == 0) ?? false"
                :highlight-ssn2="inspectedAttempt?.releaventTimes?.some(t => t.time.toString() == slotLog.time.toString() && t.ssn == 1) ?? false"
                @inspectAttempt="inspectAttempt"
            ></Slot>
        </div>
        <span ref="endOfLog"></span>
    </div>

</template>

<script setup lang="ts">

import { ref } from 'vue';
import { Sim }  from './sim/sim';
import { MS }  from './sim/ms';
import { AccessCode as SimAccessCode } from './sim/access_code';
import AccessCode from './AccessCode.vue';
import MobileStation from './MobileStation.vue';
import SimParameters from './SimParameters.vue';
import Slot from './Slot.vue';
import type { SlotLog } from './sim/slot_log';
import { TickTransmitted } from './sim/tick';

const sim = ref<Sim>(new Sim());
const AC = SimAccessCode; 

// 1 frame = 56ms
// 1 slot = 14ms
let intervalId: number | null = null;
const autorun = ref(false);
const tickTime = ref(210);   
const slotLogs = ref<SlotLog[]>([]);

// Scroll to the end of the log whenever a new slot is added
const endOfLog = ref<HTMLElement | null>(null); 
const inspectedAttempt = ref<TickTransmitted | null>(null);

/**
 * Inspect an access attempt in the sidebar.
 */
function inspectAttempt(attempt: TickTransmitted | null) {
    inspectedAttempt.value = attempt;
}

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
    const ms = new MS(issi, sim.value.getAccessCodes()[0], sim.value as Sim);
    sim.value.addMS(ms);
}

function convertSlotsToSeconds(slots: number): string {
    return (slots * 14 / 1000).toFixed(2);
}

/**
 * Compute the average access delay across all successful attempts.
 */
function getAverageAccessDelay(): string {
    let accessDelaySum = 0;
    let count = 0;
    for (const slotLog of slotLogs.value) {
        for (const event of slotLog.receptions) {
            accessDelaySum += event.slotsBetweenRequestAndResponse;
            count++;
        }
    }

    return count > 0 ? (accessDelaySum / count).toFixed(1) : "0";
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
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
    inspectedAttempt.value = null;
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
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
    }
}

</style>
