
<template>
    <div ref="marquee" v-resizeobserver="containerResize" class="p-radio-marquee" role="marquee" aria-live="polite">
        <div
            ref="track"
            class="p-radio-marquee-track"
            :style="{
                '--marquee-gap': `${gap}px`,
                '--min-width': `${containerWidth}px`,
            }"
        >
            <div class="p-radio-marquee-content">
                <span class="p-radio-marquee-station">{{ leadingText.station }}</span>
                <span class="p-radio-marquee-song">{{ leadingText.song }}</span>
            </div>
            <div class="p-radio-marquee-content">
                <span class="p-radio-marquee-station">{{ followingText.station }}</span>
                <span class="p-radio-marquee-song">{{ followingText.song }}</span>
            </div>
            <div
                v-if="nextText.length"
                v-resizeobserver="nextTextResize"
                class="p-radio-marquee-content-next"
            >
                <span class="p-radio-marquee-station">{{ nextText[0].station }}</span>
                <span class="p-radio-marquee-song">{{ nextText[0].song }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';

// ========== Props ==========
const props = defineProps({
    stationName: { type: String, required: true },
    songTitle: { type: String, required: false },
    gap: { type: Number, default: 20 },
    speed: { type: Number, default: 60 },
});

// ========== State ==========
const marquee = ref(null);
const track = ref(null);
const containerWidth = ref(0);

// Text content
const leadingText = ref(createMarqueeInfo());
const leadingTextWidth = ref(0);
const followingText = ref(createMarqueeInfo());
const followingTextWidth = ref(0);
const nextText = ref([]);
const nextTextWidth = ref(0);
let nextTextWidthUpdated = false;

let animation = null;

// ========== Utility Functions ==========
function createMarqueeInfo(station = '', song = '') {
    return { station, song };
}

function addNextText(station, song) {
    const next = createMarqueeInfo(
        song ? `${station}\u00A0•\u00A0` : station,
        song,
    );

    nextText.value.length = 0;
    nextText.value.push(next);
    nextTextWidthUpdated = false;
}

// ========== Animation Functions ==========
function createAnimation(iterations = 1) {
    if (animation) {
        animation.removeEventListener('finish', onAnimationEnd);
        animation.cancel();
    }

    const offset = leadingTextWidth.value + props.gap;
    const durationMS = (offset / props.speed) * 1000;

    const effect = new KeyframeEffect(
        track.value,
        [
            { transform: 'translateX(0)' },
            { transform: `translateX(-${offset}px)` },
        ],
        {
            duration: durationMS,
            iterations,
            easing: 'linear',
        }
    );

    animation = new Animation(effect, document.timeline);
    animation.addEventListener('finish', onAnimationEnd);
    animation.play();
}

function animationNext() {
    if (!leadingText.value.station) {
        Object.assign(leadingText.value, nextText.value.shift());
        leadingTextWidth.value = nextTextWidth.value;
        nextTextWidthUpdated = false;

        if (leadingTextWidth.value > containerWidth.value) {
            createAnimation(Infinity);
        }

    } else {
        followingText.value = nextText.value.shift();
        followingTextWidth.value = nextTextWidth.value;
        nextTextWidthUpdated = false;

        createAnimation();
    }
}

function onAnimationEnd() {
    if (leadingText.value !== followingText.value) {
        Object.assign(leadingText.value, followingText.value);
        leadingTextWidth.value = followingTextWidth.value;
    }

    if (leadingTextWidth.value <= containerWidth.value) {
        Object.assign(followingText.value, createMarqueeInfo());
        followingTextWidth.value = 0;
    }

    if (nextText.value.length && nextTextWidthUpdated) {
        animationNext();
    } else if (leadingTextWidth.value > containerWidth.value) {
        createAnimation(Infinity);
    }
}

// ========== Resize Observers ==========
function containerResize(entries) {
    if (entries.length !== 1) return;
    containerWidth.value = entries[0].contentRect.width;
}

function nextTextResize(entries) {
    if (entries.length !== 1) return;

    nextTextWidth.value = entries[0].contentRect.width;
    nextTextWidthUpdated = true;

    if (!nextText.value.length) return;

    if (!animation || animation.playState !== 'running') {
        setTimeout(animationNext, 1);
    } else {
        const timing = animation.effect.getComputedTiming();
        if (timing.iterations === Infinity) {
            animation.effect.updateTiming({ iterations: timing.currentIteration + 1 });
        }
    }
}

// ========== Watchers ==========
const watchStationAndSong = watch(
    () => [props.stationName, props.songTitle],
    () => addNextText(props.stationName, props.songTitle)
);

// ========== Lifecycle ==========
onMounted(() => {
    const marqueeRect = marquee.value.getBoundingClientRect();
    containerWidth.value = marqueeRect.width;
    leadingTextWidth.value = marqueeRect.width;

    addNextText(props.stationName, props.songTitle);
});

onBeforeUnmount(() => {
    watchStationAndSong(); // stop watcher
    if (animation) {
        animation.removeEventListener('finish', onAnimationEnd);
        animation.cancel();
    }
});
</script>

<style lang="scss">
.p-radio-marquee {
    position: relative;
    display: flex;
    align-items: center;
    width: calc(100% - 20px);
    margin: 4px 10px;
    overflow: hidden;
    line-height: 100%;
    white-space: nowrap;

    &-track {
        display: flex;
        flex-shrink: 0;
    }

    &-content,
    &-content-next {
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        min-width: var(--min-width);
        padding-right: var(--marquee-gap, 20px);
    }

    &-content-next {
        position: absolute;
        left: 100%;
    }

    &-station {
        font-weight: 700;
    }
}

</style>
