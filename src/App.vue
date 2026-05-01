<template>

    <div class="sidebar">
        <div class="title">
            <h1>TETRA Random Access Sim</h1>
        </div>

        <div class="section">
            <div class="heading">Simulation Parameters</div>
            <div class="body">
                <p>TODO: Add controls for simulation parameters here.</p>
            </div>
        </div>
        
        <div class="section">
            <div class="heading">MS Population</div>
            <div class="body">
                <p>TODO: Add controls for MS population parameters here.</p>
            </div>      
        </div>

        <div class="section">
            <div class="heading">Control</div>
            <div class="body">
                <button @click="sim.tick()">Tick</button>
            </div>      
        </div>

    </div>

    <div class="main">
        <Simulation></Simulation>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import Simulation from './Simulation.vue';
import { Sim }  from './sim/sim';

const sim = ref<Sim>(new Sim(10));

</script>

<style lang="scss" scoped>

.sidebar {
    width: 400px;
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
