<template>
<div class="radio-controls">
    <div class="radio-controls-buttons">
        <div class="radio-controls-button" @click="skipStation(-1)">
            <i class="fa fa-fast-backward" aria-hidden="true"></i>
        </div>
        <div v-if="isPlaying" class="radio-controls-button" @click="pauseStation()">
            <i class="fa fa-pause" aria-hidden="true"></i>
        </div>
        <div v-else class="radio-controls-button" @click="playStation()">
            <i class="fa fa-play" aria-hidden="true"></i>
        </div>
        <div class="radio-controls-button" @click="skipStation(1)">
            <i class="fa fa-fast-forward" aria-hidden="true"></i>
        </div>
        <div class="radio-controls-button" @click="openStationList()">
            <i class="fa fa-window-maximize" aria-hidden="true"></i>
        </div>
    </div>
    <div :class="[hasErrored ? 'radio-controls-station-errored' : '']" class="radio-controls-station">
        {{ stationName }}
    </div>
    <audio id="radio-audio" preload="none"></audio>
</div>
</template>

<script>

import state from '../libs/state.js';

export default {
    computed: {
        isPlaying() {
            return state.isPlaying();
        },
        stationName() {
            return state.getStationName() || 'No Station Selected';
        },
        hasErrored() {
            return state.hasErrored();
        }
    },
    mounted() {
        state.checkActiveStation();
    },
    methods: {
        playStation() {
            state.playStation();
        },
        pauseStation() {
            state.pauseStation();
        },
        skipStation(direction) {
            state.skipStation(direction);
        },
        openStationList() {
            kiwi.showView('StationList');
        },
    },
};
</script>
<style>
.radio-controls {
    padding-bottom: 10px;
}

.radio-controls-buttons {
    display: inline-block;
}

.radio-controls-button {
    display: inline-block;
    cursor: pointer;
    padding: 2px;
    margin-right: 10px;
}

.radio-controls-button:last-of-type {
    margin-right: 0;
}

.radio-controls-station-errored {
    color: #F00;
}
</style>
