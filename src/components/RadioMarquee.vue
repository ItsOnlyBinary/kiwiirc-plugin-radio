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

const isOverflow = ref(false);

const containerRef = ref(null);
const marqueeContentA = ref(null);
const marqueeContentB = ref(null);
const marqueeDivider = ref(null);

const widths = {
    container: 0,
    content: 0,
    divider: 0,
};

const createObserver = (target) => (entries) => {
    entries.forEach((entry) => {
        const style = getComputedStyle(entry.target);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        widths[target] = Math.ceil(entry.contentRect.width + marginLeft + marginRight);
        updateSizes();
    });
};

let animateID = null;
let animateOffset = 0;
let isTailA = false;
let lastTimestamp = null;

const animate = (timestamp) => {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const movement = (props.speed / 1000) * delta;

    animateOffset -= movement;

    if (animateOffset + widths.content + (isTailA ? widths.divider * 2 : widths.divider) <= 0) {
        isTailA = !isTailA;
        animateOffset = 0;
    }

    if (!isTailA) {
        marqueeContentA.value.style.transform = `translateX(${animateOffset}px)`;
        marqueeDivider.value.style.transform = `translateX(${animateOffset}px)`;
        marqueeContentB.value.style.transform = `translateX(${animateOffset}px)`;
    } else {
        marqueeContentA.value.style.transform = `translateX(${animateOffset + widths.content + widths.divider * 2}px)`;
        marqueeDivider.value.style.transform = `translateX(${animateOffset + widths.divider / 2}px)`;
        marqueeContentB.value.style.transform = `translateX(${animateOffset - widths.content - widths.divider}px)`;
    }

    animateID = requestAnimationFrame(animate);
};

const animateStart = () => {
    animateStop();
    animateID = requestAnimationFrame(animate);
};

const animateStop = () => {
    if (animateID != null) {
        cancelAnimationFrame(animateID);
        animateID = null;
    }
    animateOffset = 0;
    isTailA = false;
    marqueeContentA.value.style.transform = null;
};

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
