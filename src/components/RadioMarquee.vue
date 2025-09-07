<template>
    <div ref="containerRef" class="p-radio-marquee" role="marquee" aria-live="polite">
        <div ref="marqueeContentA" class="p-radio-marquee-content" :style="{ margin: isOverflow ? null : '0 auto' }">
            <div v-if="currentTail === 'A'" class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
            {{ stationTitle }}
            <template v-if="songTitle">
                <div class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
                {{ songTitle }}
            </template>
        </div>
        <div v-if="isOverflow" ref="marqueeContentB" class="p-radio-marquee-content">
            <div v-if="currentTail === 'B'" class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
            {{ stationTitle }}
            <template v-if="songTitle">
                <div class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
                {{ songTitle }}
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
    stationTitle: {
        type: String,
        required: true,
    },
    songTitle: {
        type: String,
        required: false,
    },
    gap: {
        type: Number,
        default: 10,
    },
    speed: {
        type: Number,
        default: 50, // pixels per second
    },
});

const isOverflow = ref(false);
const currentTail = ref('B');
</script>

<style lang="scss">
.p-radio-marquee {
    position: relative;
    display: block;
    width: calc(100% - 20px);
    margin: 0 10px;
    overflow: hidden;
    white-space: nowrap;

    &-content {
        display: inline-block;
        white-space: nowrap;
    }

    &-divider {
        display: inline-block;
        width: 2px;
        height: 12px;
        white-space: nowrap;
        background-color: var(--comp-statebrowser-fg, #fff);
    }
}
</style>
