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
/**
 * Object to store element widths for animation calculations
 * This object holds the widths of the container, content, and divider elements
 * It is used to determine when to start/stop the animation and for animation calculations
 */
const widths = {
    container: 0,
    content: 0,
    divider: 0,
};

/**
 * Create a resize observer for the specified target
 * @param {string} target - The target element to observe ('container', 'content', or 'divider')
 * @returns {function} - The observer function that updates widths and triggers size updates
 */
/**
 * Create a resize observer for the specified target
 * This function creates an observer that updates the widths object
 * and triggers size updates when the element is resized
 * @param {string} target - The target element to observe ('container', 'content', or 'divider')
 * @returns {function} - The observer function that updates widths and triggers size updates
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
 * Animation update interval (30 FPS)
 */
const updateInterval = 1000 / 30;

/**
 * Animation state variables
 */
let isTailA = false; // Tracks which content block is at the end
let animateID = null; // Animation frame ID
let animateOffset = 0; // Current animation offset
let lastTimestamp = null; // Last animation timestamp

/**
 * Main animation function
 * @param {number} timestamp - The current animation timestamp
 */
/**
 * Main animation function
 * This function handles the animation loop, updating positions based on time deltas
 * It calculates movement, checks for reset conditions, and applies transformations
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
 */
/**
 * Start the animation
 * This function ensures any existing animation is stopped
 * and starts a new animation loop
 */
const animateStart = () => {
    animateStop(); // Ensure any existing animation is stopped
    animateID = requestAnimationFrame(animate); // Start new animation
};

/**
 * Stop the animation
 */
/**
 * Stop the animation
 * This function cancels the animation frame and resets animation state
 * It also resets transformations on the elements
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
 * This is debounced to prevent excessive calls during rapid resizing
 */
/**
 * Update sizes and check if animation should start or stop
 * This function is debounced to prevent excessive calls during rapid resizing
 * It checks if content overflows the container and starts/stops animation as needed
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
 * Stops the animation to prevent memory leaks
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
