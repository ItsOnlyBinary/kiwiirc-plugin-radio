<template>
<div class="station-card">
	<div class="station-card-controls">
		<div @click="toggleStarred()" class="station-card-favorite">
			<i :class="[isStarred ? 'fa-star' : 'fa-star-o']" class="fa" aria-hidden="true"></i>
		</div>
		<div @click="playStation()" class="station-card-play">
			<i class="fa fa-play" aria-hidden="true"></i>
		</div>
	</div>
	<span class="station-card-title">{{ station.name }}</span>
	<div>
		<span>{{ station.description }}</span>
	</div>
</div>
</template>

<script>

import state from '../libs/state.js';

export default {
	props: ['station'],
	computed: {
		isStarred() {
			return state.isStarred(this.station);
		}
	},
	methods: {
		toggleStarred() {
			state.toggleStarred(this.station);
		},
		playStation() {
			state.playStation(this.station);
		}
	},
};

</script>

<style>

.station-card {
	height: 100%;
    min-height: 116px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.station-card-play {
	display: inline-block;
	padding: 2px;
	cursor: pointer;
}

.station-card-favorite {
	display: inline-block;
	padding: 2px;
	cursor: pointer;
}

.station-card-title {
	font-size: 1.3em;
}
</style>
