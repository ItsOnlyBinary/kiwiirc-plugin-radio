<template>
    <div class="p-radio-browser">
        <div
            class="p-radio-browser-close"
            :class="{ 'p-radio-browser-close--force': config.setting('forceShowClose') }"
        >
            <div class="u-button-secondary" :title="$t('close')" @click="radioAPI.closeStationsList()">
                <i aria-hidden="true" class="fa fa-times" />
            </div>
        </div>
        <template v-for="(station, idx) in radioAPI.stationsList">
            <div :key="`station-img-${idx}`" class="p-radio-image">
                <img :src="station.image" alt="" @load="imageLoaded" />
            </div>
            <div :key="`station-details-${idx}`" class="p-radio-details">
                <div class="p-radio-details-controls">
                    <div class="p-radio-details-favourite" @click="radioAPI.toggleStarred(station)">
                        <i
                            :class="[radioAPI.isStarred(station) ? 'fa-star' : 'fa-star-o']"
                            class="fa"
                            aria-hidden="true"
                        />
                    </div>
                    <div
                        v-if="radioAPI.playerPlaying && radioAPI.stationActive === station"
                        class="p-radio-details-play"
                        @click="radioAPI.pauseStation()"
                    >
                        <i class="fa fa-pause" aria-hidden="true" />
                    </div>
                    <div v-else class="p-radio-details-play" @click="playStationClose(station)">
                        <i class="fa fa-play" aria-hidden="true" />
                    </div>
                </div>
                <span class="p-radio-details-title">{{ station.name }}</span>
                <div class="p-radio-description">
                    {{ station.description }}
                </div>
                <span class="p-radio-channels" @click="channelClick" v-html="channelsHtml(station.channels)" />
            </div>
        </template>
    </div>
</template>

<script setup>
/* global kiwi:true */

import * as config from '@/config.js';

const TextFormatting = kiwi.require('helpers/TextFormatting');

const { radioAPI } = defineProps({
    radioAPI: {
        type: Object,
        required: true,
    },
});

const imageLoaded = (event) => (event.target.classList.add('p-radio-loaded'));

const channelsHtml = (channels) => (channels || []).map((chan) => TextFormatting.linkifyChannels(chan)).join(', ');

const channelClick = (event) => {
    const channelName = event.target.getAttribute('data-channel-name');
    if (channelName) {
        const network = kiwi.state.getActiveNetwork();
        const buffer = kiwi.state.getBufferByName(network.id, channelName);

        if (!buffer) {
            kiwi.state.addBuffer(network.id, channelName);
            network.ircClient.join(channelName);
        }

        if (buffer || kiwi.state.ui.is_narrow) {
            kiwi.state.setActiveBuffer(network.id, channelName);
            radioAPI.closeStationsList();
        }
    }
};

const playStationClose = (station) => {
    radioAPI.playStation(station);
    if (kiwi.state.ui.is_narrow) {
        radioAPI.closeStationsList();
    }
};
</script>

<style lang="scss">
.p-radio-browser {
    display: grid;
    grid-template-columns: max-content auto;
    row-gap: 10px;
    padding: 10px;
    overflow-y: auto;
}

.p-radio-image,
.p-radio-details {
    background-color: rgba(128, 128, 128, 0.2);
}

.p-radio-image {
    min-height: 114px;

    > img {
        max-width: 200px;
        max-height: 100px;

        &.p-radio-loaded {
            margin: 7px 7px 0 7px;
        }
    }
}

.p-radio-details {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4px 10px;
}

.p-radio-details-play {
    display: inline-block;
    padding: 2px;
    cursor: pointer;
}

.p-radio-details-favourite {
    display: inline-block;
    padding: 2px;
    cursor: pointer;
}

.p-radio-details-title {
    font-size: 1.3em;
    font-weight: 700;
}

.p-radio-channels {
    font-size: 1.1em;
    font-weight: 500;
}

.p-radio-browser-close {
    display: none;
    grid-column: span 2;
    background-color: initial;

    > div {
        float: right;
        padding: 0 6px;
        font-weight: 600;
        color: var(--brand-default-bg, #fff);
        cursor: pointer;
        background: var(--brand-error, #bf5155);
    }

    &--force {
        display: initial;
    }
}

@media screen and (max-width: 769px) {
    .p-radio-browser-close {
        display: initial;
    }
}
</style>
