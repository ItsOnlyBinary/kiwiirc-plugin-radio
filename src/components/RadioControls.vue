<template>
    <div class="p-radio-controls" :class="{ 'p-radio-errored': radioAPI.stationsList.length === 0 }">
        <canvas ref="radioCanvas" />
        <div class="p-radio-buttons">
            <div :title="$t('plugin-radio:previous')" @click="buttonClick($event); radioAPI.skipStation(-1)">
                <svg-icon icon="fa-solid fa-fast-backward" fixed-width />
            </div>
            <div v-if="radioAPI.playerPlaying" :title="$t('plugin-radio:pause')" @click="buttonClick($event); radioAPI.pauseStation()">
                <svg-icon icon="fa-solid fa-pause" fixed-width />
            </div>
            <div v-else :title="$t('plugin-radio:play')" @click="buttonClick($event); radioAPI.playStation()">
                <svg-icon icon="fa-solid fa-play" fixed-width />
            </div>
            <div :title="$t('plugin-radio:next')" @click="buttonClick($event); radioAPI.skipStation(1)">
                <svg-icon icon="fa-solid fa-fast-forward" fixed-width />
            </div>
            <div :title="$t('plugin-radio:stationsList')" @click="buttonClick($event); radioAPI.toggleStationsList()">
                <svg-icon icon="fa-solid fa-th-list" fixed-width />
            </div>
            <div class="p-radio-volume">
                <div class="p-radio-mute" :title="$t('plugin-radio:mute')" @click="buttonClick($event); radioAPI.toggleMute()">
                    <svg-icon v-if="radioAPI.playerVolume === 0" icon="fa-solid fa-volume-off" fixed-width />
                    <svg-icon v-else-if="radioAPI.playerVolume >= 0.5" icon="fa-solid fa-volume-up" fixed-width />
                    <svg-icon v-else icon="fa-solid fa-volume-down" fixed-width />
                </div>
                <div class="p-radio-volume-container">
                    <input
                        ref="radio-volume"
                        v-model="radioAPI.playerVolumeModel"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        class="p-radio-volume-slider"
                    >
                </div>
            </div>
        </div>
        <RadioMarquee
            v-if="config.setting('showMarquee')"
            :station-name="radioAPI.stationName || TextFormatting.t('plugin-radio:stationNone')"
            :song-title="radioAPI.songTitle"
            class="p-radio-marquee"
            :class="{ 'p-radio-errored': radioAPI.stationErrored }"
        />
        <div v-else class="p-radio-title">
            <div>
                {{ radioAPI.stationName || TextFormatting.t('plugin-radio:stationNone') }}
            </div>
            <transition-expand>
                <div v-if="radioAPI.songTitle">
                    {{ radioAPI.songTitle }}
                </div>
            </transition-expand>
        </div>
        <audio
            ref="radioAudio"
            preload="none"
            crossorigin="anonymous"
            style="display: none"
            @play="radioAPI.onPlay"
            @pause="radioAPI.onPause"
            @ended="radioAPI.onPause"
            @error="radioAPI.onError"
        />
    </div>
</template>

<script setup>
/* global kiwi:true */

import { onMounted, ref } from 'vue';
import RadioMarquee from '@/components/RadioMarquee';

import * as config from '@/config.js';

const TextFormatting = kiwi.require('helpers/TextFormatting');

/**
 * Define props for the component
 * @type {Object}
 */
const { radioAPI } = defineProps({
    radioAPI: {
        type: Object,
        required: true,
    },
});

/**
 * References to DOM elements
 */
const radioAudio = ref(null); // Reference to the audio element
const radioCanvas = ref(null); // Reference to the canvas element

let clickTimeout = null;
function buttonClick(event) {
    if (!event.target) {
        return;
    }
    if (clickTimeout) {
        clearTimeout(clickTimeout.id);
        buttonClickReset(clickTimeout.target);
        clickTimeout = null;
    }
    event.target.style.color = 'var(--brand-primary, #42b992)';

    clickTimeout = {
        id: setTimeout(() => buttonClickReset(event.target), 500),
        target: event.target,
    };
}

function buttonClickReset(target) {
    target.style.color = null;
}

/**
 * Lifecycle hook that runs when the component is mounted
 */
onMounted(() => {
    // Set the audio element in the radioAPI
    radioAPI.playerElement = radioAudio.value;

    // Initialize canvas for wave visualization
    radioAPI.waveData.canvas = radioCanvas.value;
    radioAPI.waveData.canvasCtx = radioAPI.waveData.canvas.getContext('2d');

    // Check for autoplay functionality
    radioAPI.checkForAutoplay();
});
</script>

<style lang="scss">
.p-radio-controls {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
    }
}

.p-radio-buttons {
    display: inline-flex;
    gap: 4px;
    justify-content: center;
    user-select: none;

    > div {
        padding: 2px;
        cursor: pointer;
    }
}

.p-radio-volume {
    position: relative;

    &:hover .p-radio-volume-container {
        display: inherit;
    }
}

.p-radio-volume-container {
    position: absolute;
    top: 2px;
    left: -2px;
    display: none;
    transform: rotate(270deg);
    transform-origin: 0% 0%;

    &:hover {
        display: inherit;
    }
}

.p-radio-volume-slider {
    width: 80px;
    height: 6px;
    appearance: none;
    cursor: pointer;
    background: transparent;

    &:focus {
        outline: none;
    }

    &::-webkit-slider-runnable-track {
        height: 0.5rem;
        background-color: var(--comp-statebrowser-bg-networkname, #454545);
        border-radius: 0.5rem;
    }

    &::-webkit-slider-thumb {
        width: 1rem;
        height: 1rem;
        margin-top: -4px;
        appearance: none;
        background-color: var(--brand-primary, #2f896b);
        border-radius: 50%;
    }

    &::-moz-range-track {
        height: 0.5rem;
        background-color: var(--comp-statebrowser-bg-networkname, #454545);
        border-radius: 0.5rem;
    }

    &::-moz-range-thumb {
        width: 1rem;
        height: 1rem;
        background-color: var(--brand-primary, #2f896b);
        border: none;
        border-radius: 50%;
    }
}

.p-radio-title {
    padding: 0 6px;
}

.p-radio-errored {
    color: var(--brand-error, #bf5155);
}
</style>
