<template>
    <!-- RadioMarquee.vue - Component for scrolling text display -->
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
            <span class="p-radio-marquee-station">{{ stationTitle }}</span>
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
                <span class="p-radio-marquee-station">{{ stationTitle }}</span>
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

/**
 * Define component props
 */
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
        default: 15,
    },
    speed: {
        type: Number,
        default: 60,
    },
});

/**
 * Reactive references
 */
const isOverflow = ref(false);
const containerRef = ref(null);
const marqueeContentA = ref(null);
const marqueeContentB = ref(null);
const marqueeDivider = ref(null);

/**
 * Object to store element widths
 */
const widths = {
    container: 0,
    content: 0,
    divider: 0,
};

/**
 * Create a resize observer for the specified target
 * @param {string} target - The target element to observe
 * @returns {function} - The observer function
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
const updateInterval = 1000 / 30;

/**
 * Animation state variables
 */
let isTailA = false;
let animateID = null;
let animateOffset = 0;
let lastTimestamp = null;

/**
 * Main animation function
 * @param {number} timestamp - The current animation timestamp
 */
const animate = (timestamp) => {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }
    const delta = timestamp - lastTimestamp;

    if (delta >= updateInterval) {
        const moveDelta = delta;
        lastTimestamp = timestamp;

        const movement = (props.speed / 1000) * moveDelta;
        animateOffset -= movement;

        const doubleDivider = widths.divider * 2;
        if (animateOffset + widths.content + (isTailA ? doubleDivider : widths.divider) <= 0) {
            isTailA = !isTailA;
            animateOffset = 0;
        }

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

    animateID = requestAnimationFrame(animate);
};

/**
 * Start the animation
 */
const animateStart = () => {
    animateStop();
    animateID = requestAnimationFrame(animate);
};

/**
 * Stop the animation
 */
const animateStop = () => {
    if (animateID != null) {
        cancelAnimationFrame(animateID);
        animateID = null;
    }
    isTailA = false;
    animateOffset = 0;
    lastTimestamp = null;
    marqueeContentA.value.style.transform = null;
};

/**
 * Update sizes and check if animation should start or stop
 */
const updateSizes = debounce(() => {
    if (widths.content > widths.container && isOverflow.value === false) {
        isOverflow.value = true;
    } else if (widths.content <= widths.container && isOverflow.value === true) {
        isOverflow.value = false;
        animateStop();
    }

    if (!animateID && isOverflow.value && marqueeDivider.value) {
        animateStart();
    }
}, 0);

/**
 * Clean up on component unmount
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
