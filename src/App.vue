<template>

    <div class="sidebar">
        <div class="title">
            <h1>TETRA Random Access Sim</h1>
        </div>

        <div class="section">
            <div class="heading">Control</div>
            <div class="body">
                {{ sim.getTime().toString() }}
                <button @click="tick()">Advance</button>
                <button @click="sim.reset()">Reset</button>
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
            </div>
            <div class="body">
                <MobileStation v-for="(mobileStation, index) in sim.getMobileStations()" :mobile-station="mobileStation" :id="index"></MobileStation>
            </div>      
        </div>

    </div>

    <div class="main">

        <Slot v-for="(slotLog, index) in slotLogs" :slot-log="slotLog" :id="index"></Slot>

    </div>

</template>

<script setup lang="ts">

import { ref } from 'vue';
import { Sim }  from './sim/sim';
import { MS }  from './sim/ms';
import AccessCode from './AccessCode.vue';
import MobileStation from './MobileStation.vue';
import SimParameters from './SimParameters.vue';
import { TDMATime } from './sim/time';
import { TickEvent, TickTransmitted } from './sim/tick';
import Slot from './Slot.vue';

const sim = ref<Sim>(new Sim());

// TODO - Populate this in sim instead
// Needs to also capture the access code used for each subslot, so we can display that in the logs
class SlotLog {

    private events: TickEvent[] = [];
    public transmitted: [boolean, boolean] = [false, false];
    public collided: [boolean, boolean] = [false, false];

    constructor(public time: TDMATime) {
    }

    public pushEvent(event: TickEvent) {

        // Log the event
        this.events.push(event);

        if (event instanceof TickTransmitted) {

            // Already transmitted-in?
            if (this.transmitted[event.subslot]) {
                this.collided[event.subslot] = true;
            }

            this.transmitted[event.subslot] = true;
        }
        
    }
    
}

const slotLogs = ref<SlotLog[]>([]);

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
 * Advance the simulation by one tick, and log any events that occur.
 */
function tick() {
    let log = new SlotLog(sim.value.getTime());
    let events = sim.value.tick();
    for (const event of events) {
        log.pushEvent(event);
    }
    slotLogs.value.push(log);
}

</script>

<style lang="scss" scoped>

.sidebar {
    width: 500px;
    height: 100vh;
    background-color: #f0f0f0;
    float: left;

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

.main {
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    flex: 1;
    // wrap
    flex-wrap: wrap;
    // align items to the top
    align-items: flex-start;
    // justify content to the start
    justify-content: flex-start;
}

</style>
