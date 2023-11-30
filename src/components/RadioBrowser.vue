<template>
    <div class="p-radio-browser">
        <div class="p-radio-browser-close">
            <div class="u-button-secondary" @click="radioAPI.closeStationsList()">{{ $t('close') }}</div>
        </div>
        <table>
            <tr v-for="station in radioAPI.stationsList" :key="station.id">
                <td><img :src="station.image" alt="" /></td>
                <td>
                    <div class="p-radio-details">
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
                        <div>
                            <span>{{ station.description }}</span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup>
/* global kiwi:true */

// eslint-disable-next-line vue/no-setup-props-destructure
const { radioAPI } = defineProps({
    radioAPI: {
        type: Object,
        required: true,
    },
});

const playStationClose = (station) => {
    radioAPI.playStation(station);
    if (kiwi.state.ui.is_narrow) {
        radioAPI.closeStationsList();
    }
};
</script>

<style lang="scss">
.p-radio-browser {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    overflow-x: auto;
}

.p-radio-browser table {
    border-spacing: 0 10px;
    border-collapse: separate;

    tr {
        text-align: center;
        background-color: rgba(128, 128, 128, 0.2);
    }

    td:last-of-type {
        width: 100%;
        text-align: left;
    }

    img {
        max-width: 200px;
        max-height: 100px;
        margin: 0 7px;
        margin-top: 7px;
    }
}

.p-radio-details {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    min-height: 116px;
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
}

.p-radio-browser-close {
    display: none;

    > div {
        float: right;
        padding: 0 6px;
        font-weight: 600;
        cursor: pointer;
    }
}

@media screen and (max-width: 769px) {
    .p-radio-browser-close {
        display: initial;
    }
}
</style>
