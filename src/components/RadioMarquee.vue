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
            :style="{ margin: isOverflow ? null : '0 auto' }"
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
                ref="marqueeDivider"
                class="p-radio-marquee-divider"
                :style="{ margin: `0 ${gap / 2}px` }"
            />
            <div ref="marqueeContentB" class="p-radio-marquee-content">
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
// eslint-disable-next-line no-unused-vars
import { debounce } from 'lodash';
import { ref, onUnmounted } from 'vue';

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
    console.log('containerObserver called');
    entries.forEach((entry) => {
        containerWidth = Math.ceil(entry.contentRect.width);
        console.log('containerWidth width changed:', containerWidth);
        updateSizes();
    });
};
const contentObserver = (entries) => {
    console.log('contentObserver called');
    entries.forEach((entry) => {
        contentWidth = Math.ceil(entry.contentRect.width);
        console.log('contentWidth width changed:', contentWidth);
        updateSizes();
    });
};
// eslint-disable-next-line no-unused-vars
const dividerObserver = (entries) => {
    console.log('dividerObserver called');
    entries.forEach((entry) => {
        const style = getComputedStyle(entry.target);
        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;
        dividerWidth = Math.ceil(entry.contentRect.width + marginLeft + marginRight);
        // dividerWidth = Math.ceil(entry.contentRect.width);
        console.log('dividerWidth width changed:', dividerWidth);
        // nextTick(() => updateSizes());
        updateSizes();
    });
};

let containerWidth = 0;
let contentWidth = 0;
let dividerWidth = 0;

let animateID = null;
let animateOffset = 0;
let isTailA = false;

const animate = () => {
    console.log('animate called');
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

// eslint-disable-next-line no-unused-vars
const animateStart = () => {
    console.log('animateStart called');
    animateStop();
    animateID = requestAnimationFrame(animate);
};

const animateStop = () => {
    console.log('animateStop called');
    if (animateID != null) {
        cancelAnimationFrame(animateID);
        animateID = null;
    }
    animateOffset = 0;
    isTailA = false;
    marqueeContentA.value.style.transform = null;
};

const updateSizes = debounce(() => {
    console.log('updateSizes called', !!marqueeDivider.value);
    if (contentWidth > containerWidth && isOverflow.value === false) {
        isOverflow.value = true;
    } else if (contentWidth <= containerWidth && isOverflow.value === true) {
        isOverflow.value = false;
        animateStop();
    }

    if (isOverflow.value && !animateID && marqueeDivider.value) {
        animateStart();
    }
}, 1);

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
