<template>
    <div class="station-container">
        <div class="station-list">
            <table>
                <tr v-for="station in stationList" :key="station.id">
                    <td><img :src="station.image"></td>
                    <td><station-card :station="station"></station-card></td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>

import state from '../libs/state.js';
import StationCard from './StationCard.vue';

export default {
    components: {
        StationCard,
    },
    computed: {
        stationList() {
            return state.stationList;
        }
    }
};

</script>

<style>
.station-container {
    height: 100%;
}

.station-list {
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: 100%;
    overflow-x: scroll;
}

.station-list img {
    margin: 0 7px;
    margin-top: 7px;
    max-height: 100px;
    max-width: 200px;
}

.station-list table {
    border-collapse: separate;
    border-spacing: 0 10px;
}

.station-list table tr {
    background-color: rgba(128, 128, 128, 0.2);
    text-align: center;
}

.station-list table tr > td:last-of-type {
    width: 100%;
    text-align: left;
}
</style>
