<template>
    <div
        ref="containerRef"
        v-resizeobserver="containerObserver"
        class="p-radio-marquee"
        role="marquee"
        aria-live="polite"
    >
        <div
            ref="marqueeContentA"
            v-resizeobserver="contentObserver"
            class="p-radio-marquee-content"
            :style="{ margin: isOverflow ? null : '0 auto', color: 'green' }"
        >
            {{ stationTitle }}
            <template v-if="songTitle">
                <div class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
                {{ songTitle }}
            </template>
        </div>
        <template v-if="isOverflow">
            <div
                v-resizeobserver="dividerObserver"
                class="p-radio-marquee-divider"
                :style="{ margin: `0 ${gap / 2}px` }"
            />
            <div ref="marqueeContentB" class="p-radio-marquee-content" :style="{ color: 'red' }">
                {{ stationTitle }}
                <template v-if="songTitle">
                    <div class="p-radio-marquee-divider" :style="{ margin: `0 ${gap / 2}px` }" />
                    {{ songTitle }}
                </template>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

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

const containerRef = ref(null);
const marqueeContentA = ref(null);
const marqueeContentB = ref(null);
const marqueeDivider = ref(null);

// Width observers
const containerObserver = (entries) => {
    entries.forEach((entry) => {
        containerWidth = Math.ceil(entry.contentRect.width);
        console.log('containerRef width changed:', containerWidth);
        updateSizes();
    });
};
let contentObserver = (entries) => {
    entries.forEach((entry) => {
        contentWidth = Math.ceil(entry.contentRect.width);
        console.log('marqueeContentA width changed:', contentWidth);
        updateSizes();
    });
};
const dividerObserver = (entries) => {
    entries.forEach((entry) => {
        const style = getComputedStyle(entry.target);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        dividerWidth = Math.ceil(entry.contentRect.width + marginLeft + marginRight);
        console.log('marqueeDivider width changed:', dividerWidth);
    });
};

let containerWidth = 0;
let contentWidth = 0;
let dividerWidth = 0;

let animateID = null;
let animateOffset = 0;
let isTailA = false;

const animate = () => {
    animateOffset -= 1;

    if (!isTailA && animateOffset + contentWidth + dividerWidth <= 0) {
        isTailA = !isTailA;
        animateOffset = 0;
    } else if (animateOffset + contentWidth + dividerWidth * 2 <= 0) {
        isTailA = !isTailA;
        animateOffset = 0;
    }

    if (!isTailA) {
        marqueeContentA.value.style.transform = `translateX(${animateOffset}px)`;
        marqueeDivider.value.style.transform = `translateX(${animateOffset}px)`;
        marqueeContentB.value.style.transform = `translateX(${animateOffset}px)`;
    } else {
        marqueeContentA.value.style.transform = `translateX(${animateOffset + contentWidth + dividerWidth * 2}px)`;
        marqueeDivider.value.style.transform = `translateX(${animateOffset + dividerWidth / 2}px)`;
        marqueeContentB.value.style.transform = `translateX(${animateOffset - contentWidth - dividerWidth}px)`;
    }

    animateID = requestAnimationFrame(animate);
};

window.animate = animate;

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

const updateSizes = () => {
    if (contentWidth > containerWidth && isOverflow.value === false) {
        isOverflow.value = true;
        animateStart();
    } else if (isOverflow.value === true) {
        isOverflow.value = false;
        animateStop();
    }
};

onMounted(() => {
});

onUnmounted(() => {
    animateStop();
});
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
        box-sizing: border-box;
        display: inline-block;
        width: 2px;
        height: 12px;
        white-space: nowrap;
        background-color: var(--comp-statebrowser-fg, #fff);
    }
}
</style>
