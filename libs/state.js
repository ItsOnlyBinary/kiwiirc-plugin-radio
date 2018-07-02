import StationList from '../components/StationList.vue';

const state = new kiwi.Vue({
	data() {
		return {
			audio: null,
			stationActive: null,
			stationErrored: false,
			stationListOpen: false,
			stationFavourites: [],
			stationList: [],
			playerElement: null,
			playerPlaying: false,
		};
	},
	methods: {
		playStation(station) {
			if (!this.playerElement) {
				let self = this;
				this.playerElement = document.getElementById('radio-audio');
				this.playerElement.addEventListener('error', (event) => {
					this.playerPlaying = false;
					this.stationErrored = true;
				});
			}

			// if there is not a station attempt to play the active station
			if (!station) {
				if (this.stationActive) {
					station = this.stationActive;
				} else {
					station = this.getRandomStation();
				}
			}

			this.playerElement.src = station.source;
			this.makeStationActive(station);
			this.playerElement.play();
			this.playerPlaying = true;
		},
		makeStationActive(station) {
			this.stationActive = station;
			this.stationErrored = false;
			kiwi.state.setting('plugin-radio.active', station.name);
		},
		pauseStation() {
			this.playerElement.pause();
			this.playerPlaying = false;
		},
		getRandomStation() {
			return this.stationList[Math.floor(Math.random() * this.stationList.length)];
		},
		skipStation(direction) {
			// decide if we are skipping through stared or station list
			let stations = this.getStarred();
			if (stations.length <= 1) {
				stations = this.stationList;
			}

			let stationIdx = this.getStationIdx(stations, this.stationActive);
			let playIdx = direction > 0 ? 0 : stations.length - 1;

			if (stationIdx !== null) {
				if (stationIdx + direction > stations.length - 1) {
					playIdx = 0;
				} else if (stationIdx + direction < 0) {
					playIdx = stations.length - 1;
				} else {
					playIdx = stationIdx + direction;
				}
			}
			let station = stations[playIdx];

			if (this.isPlaying()) {
				this.playStation(station);
			} else {
				this.makeStationActive(station);
			}
		},
		getStationIdx(stations, station) {
			if (!station) {
				return -1;
			}
			for (let i in stations) {
				let item = stations[i];
				if (item.name === station.name) {
					return parseFloat(i);
				}
			}
			return null
		},
		getStationName() {
			if (!this.stationActive) {
				return '';
			}
			return this.stationActive.name;
		},
		hasErrored() {
			return this.stationErrored;
		},
		isPlaying() {
			return this.playerPlaying;
		},
		isStarred(station) {
			let starred = kiwi.state.setting('plugin-radio.starred');
			for (let i in starred) {
				if (starred[i] === station.name) {
					return true;
				}
			}
			return false;
		},
		getActive() {
			let active = kiwi.state.setting('plugin-radio.active');
			if (!active) {
				return;
			}
			for (let i in this.stationList) {
				let station = this.stationList[i];
				if (station.name === active) {
					return station;
				}
			}
		},
		getStarred() {
			let starred = kiwi.state.setting('plugin-radio.starred');
			let out = [];
			for (let i in starred) {
				let name = starred[i];
				for (let ii in this.stationList) {
					let station = this.stationList[ii];
					if (station.name === name) {
						out.push(station);
						break;
					}
				}
			}
			return out;
		},
		toggleStarred(station) {
			let starred = kiwi.state.setting('plugin-radio.starred').slice();
			if (this.isStarred(station)) {
				for (let i = starred.length - 1; i >= 0; i--) {
					if (starred[i] === station.name) {
						starred.splice(i, 1);
						break;
					}
				}
			} else {
				starred.push(station.name);
			}
			kiwi.state.setting('plugin-radio.starred', (starred.length > 0) ? starred : null);
		},
		checkActiveStation() {
			if (this.stationActive) {
				return;
			}

			let active = this.getActive();
			if (active) {
				this.makeStationActive(active);
				return
			}

			let starred = this.getStarred();
			if (starred.length > 0) {
				this.makeStationActive(starred[0]);
			}
		},
	},
});

export default state;
