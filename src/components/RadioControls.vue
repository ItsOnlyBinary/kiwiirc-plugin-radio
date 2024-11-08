<template>
    <div class="p-radio-controls" :class="{ 'p-radio-errored': radioAPI.stationsList.length === 0 }">
        <canvas ref="radioCanvas" />
        <div class="p-radio-buttons">
            <div :title="$t('plugin-radio:previous')" @click="radioAPI.skipStation(-1)">
                <i class="fa fa-fast-backward fa-fw" aria-hidden="true" />
            </div>
            <div v-if="radioAPI.playerPlaying" :title="$t('plugin-radio:pause')" @click="radioAPI.pauseStation()">
                <i class="fa fa-pause fa-fw" aria-hidden="true" />
            </div>
            <div v-else :title="$t('plugin-radio:play')" @click="radioAPI.playStation()">
                <i class="fa fa-play fa-fw" aria-hidden="true" />
            </div>
            <div :title="$t('plugin-radio:next')" @click="radioAPI.skipStation(1)">
                <i class="fa fa-fast-forward fa-fw" aria-hidden="true" />
            </div>
            <div :title="$t('plugin-radio:stationsList')" @click="radioAPI.toggleStationsList()">
                <i class="fa fa-th-list fa-fw" aria-hidden="true" />
            </div>
            <div class="p-radio-volume">
                <div class="p-radio-mute" :title="$t('plugin-radio:mute')" @click="radioAPI.toggleMute()">
                    <i v-if="radioAPI.playerVolume === 0" class="fa fa-volume-off fa-fw" aria-hidden="true" />
                    <i v-else-if="radioAPI.playerVolume >= 0.5" class="fa fa-volume-up fa-fw" aria-hidden="true" />
                    <i v-else class="fa fa-volume-down fa-fw" aria-hidden="true" />
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
                    />
                </div>
            </div>
        </div>
        <div :class="{ 'p-radio-errored': radioAPI.stationErrored }" class="p-radio-station">
            {{ radioAPI.stationName || $t('plugin-radio:stationNone') }}
        </div>
        <audio
            ref="radioAudio"
            preload="none"
            crossorigin="anonymous"
            style="display: none"
            @play="radioAPI.onPlay"
            @pause="radioAPI.onPause"
            @error="radioAPI.onError"
        />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const { radioAPI } = defineProps({
    radioAPI: {
        type: Object,
        required: true,
    },
});

const radioAudio = ref(null);
const radioCanvas = ref(null);

onMounted(() => {
    radioAPI.playerElement = radioAudio.value;

    // Store canvas element
    radioAPI.waveData.canvas = radioCanvas.value;
    radioAPI.waveData.canvasCtx = radioAPI.waveData.canvas.getContext('2d');

    radioAPI.checkForAutoplay();
});
</script>

<style lang="scss">
.p-radio-controls {
    position: relative;
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
    top: 10px;
    left: -4px;
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
    margin: 12px;
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

.p-radio-errored {
    color: var(--brand-error, #bf5155);
}
</style>
