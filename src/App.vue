<template>

    <div class="sidebar">
        <div class="title">
            <h1>TETRA Random Access Sim</h1>
        </div>

        <div class="section">
            <div class="heading">Control</div>
            <div class="body">
                {{ sim.getTime().toString() }}
                <button @click="sim.tick()">Advance</button>
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
    </div>

</template>

<script setup lang="ts">

import { ref } from 'vue';
import { Sim }  from './sim/sim';
import { MS }  from './sim/ms';
import AccessCode from './AccessCode.vue';
import MobileStation from './MobileStation.vue';
import SimParameters from './SimParameters.vue';

const sim = ref<Sim>(new Sim());

/**
 * Add an MS to the simulation, by default using Access Code A.
 */
function addMS() {
    // Generate an incremental ISSI based on 1024 + the current number of MS instances
    const issi = 1024 + sim.value.getMobileStations().length;
    const ms = new MS(issi, sim.value.getAccessCodes()[0], sim.value);
    sim.value.addMS(ms);
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
    height: 100vh;
    background-color: #ffffff;
    float: left;
    flex: 1;
}

</style>
