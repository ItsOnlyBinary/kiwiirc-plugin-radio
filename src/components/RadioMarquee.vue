<template>
    <div
        ref="containerRef"
        v-resizeobserver="createObserver('container')"
        class="p-radio-marquee"
        role="marquee"
        aria-live="polite"
    >
        <div
            ref="marqueeContentA"
            v-resizeobserver="createObserver('content')"
            class="p-radio-marquee-content"
            :style="{ margin: isOverflow ? null : '0 auto' }"
        >
            <span class="p-radio-marquee-station">{{ stationName }}</span>
            <template v-if="songTitle">
                <div class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
                <span class="p-radio-marquee-song">{{ songTitle }}</span>
            </template>
        </div>
        <template v-if="isOverflow">
            <div
                ref="marqueeDivider"
                v-resizeobserver="createObserver('divider')"
                class="p-radio-marquee-divider"
                :style="{ margin: `0 ${gap / 2}px` }"
            />
            <div ref="marqueeContentB" class="p-radio-marquee-content">
                <span class="p-radio-marquee-station">{{ stationName }}</span>
                <template v-if="songTitle">
                    <div class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
                    <span class="p-radio-marquee-song">{{ songTitle }}</span>
                </template>
            </div>
        </template>
    </div>
</template>

<script setup>
import { debounce } from 'lodash';
import { ref, onUnmounted } from 'vue';

import * as config from '@/config.js';

/**
 * Define component props
 */
const props = defineProps({
    stationName: {
        type: String,
        required: true,
    },
    songTitle: {
        type: String,
        required: false,
    },
    gap: {
        type: Number,
        default: 15,
    },
    speed: {
        type: Number,
        default: 60,
    },
});

/**
 * Reactive references for DOM elements
 */
const isOverflow = ref(false);
const containerRef = ref(null);
const marqueeContentA = ref(null);
const marqueeContentB = ref(null);
const marqueeDivider = ref(null);

/**
 * Object to store element widths for animation calculations
 */
const widths = {
    container: 0,
    content: 0,
    divider: 0,
};

/**
 * Create a resize observer for the specified target
 */
const createObserver = (target) => (entries) => {
    entries.forEach((entry) => {
        const style = getComputedStyle(entry.target);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        widths[target] = Math.ceil(entry.contentRect.width + marginLeft + marginRight);
        updateSizes();
    });
};

/**
 * Animation update interval
 */
const updateInterval = 1000 / config.getSetting('animationsFPS');

/**
 * Animation state variables
 */
let isTailA = false; // Tracks which content block is at the end
let animateID = null; // Animation frame ID
let animateOffset = 0; // Current animation offset
let lastTimestamp = null; // Last animation timestamp

/**
 * Main animation function
 * This function is called repeatedly to update the animation frame.
 * It calculates the movement based on the speed and updates the position of the marquee content.
 */
const animate = (timestamp) => {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }
    const delta = timestamp - lastTimestamp;

    if (delta >= updateInterval) {
        const moveDelta = delta;
        lastTimestamp = timestamp;

        // Calculate movement based on speed
        const movement = (props.speed / 1000) * moveDelta;
        animateOffset -= movement;

        // Calculate double divider width for animation logic
        const doubleDivider = widths.divider * 2;

        // Check if we need to reset the animation position
        if (animateOffset + widths.content + (isTailA ? doubleDivider : widths.divider) <= 0) {
            isTailA = !isTailA; // Switch which content block is at the end
            animateOffset = 0; // Reset offset
        }

        // Apply transformations based on animation state
        if (!isTailA) {
            marqueeContentA.value.style.transform = `translateX(${animateOffset}px)`;
            marqueeDivider.value.style.transform = `translateX(${animateOffset}px)`;
            marqueeContentB.value.style.transform = `translateX(${animateOffset}px)`;
        } else {
            marqueeContentA.value.style.transform = `translateX(${animateOffset + widths.content + doubleDivider}px)`;
            marqueeDivider.value.style.transform = `translateX(${animateOffset + widths.divider / 2}px)`;
            marqueeContentB.value.style.transform = `translateX(${animateOffset - widths.content - widths.divider}px)`;
        }
    }

    // Request next animation frame
    animateID = requestAnimationFrame(animate);
};

/**
 * Start the animation
 * This function stops any existing animation and starts a new one.
 */
const animateStart = () => {
    animateStop(); // Ensure any existing animation is stopped
    animateID = requestAnimationFrame(animate); // Start new animation
};

/**
 * Stop the animation
 * This function stops the animation and resets the animation state.
 */
const animateStop = () => {
    if (animateID != null) {
        cancelAnimationFrame(animateID);
        animateID = null;
    }
    isTailA = false;
    animateOffset = 0;
    lastTimestamp = null;
    marqueeContentA.value.style.transform = null; // Reset transformations
};

/**
 * Update sizes and check if animation should start or stop
 * This function is called whenever the size of the marquee content changes.
 * It checks if the content overflows the container and starts or stops the animation accordingly.
 */
const updateSizes = debounce(() => {
    // Check if content overflows container
    if (widths.content > widths.container && isOverflow.value === false) {
        isOverflow.value = true;
    } else if (widths.content <= widths.container && isOverflow.value === true) {
        isOverflow.value = false;
        animateStop(); // Stop animation if content fits
    }

    // Start animation if needed
    if (!animateID && isOverflow.value && marqueeDivider.value) {
        animateStart();
    }
}, 0);

/**
 * Clean up on component unmount
 * This function stops the animation when the component is unmounted.
 */
onUnmounted(() => {
    animateStop();
});
</script>

<style lang="scss">
.p-radio-marquee {
    position: relative;
    display: block;
    width: calc(100% - 20px);
    margin: 4px 10px;
    overflow: hidden;
    line-height: 100%;
    white-space: nowrap;

    &-content {
        display: inline-block;
        white-space: nowrap;
    }

    &-station {
        font-weight: 700;
    }

    &-divider {
        box-sizing: border-box;
        display: inline-block;
        width: 2px;
        height: 1em;
        white-space: nowrap;
        vertical-align: bottom;
        background-color: var(--comp-statebrowser-fg, #fff);
    }
}
</style>
