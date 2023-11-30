/* global kiwi:true */

import { computed, reactive, watch } from 'vue';

import useEqualizer from '@/libs/useEqualizer';

import * as config from '@/config.js';

export default function useRadioAPI() {
    const { waveData, animateCanvas } = useEqualizer();

    const api = reactive({
        waveData,
        stationsList: [],
        playerElement: null,
        playerPlaying: false,
        playerVolume: 0,
        muteVolume: 0,
        stationActive: null,
        stationErrored: false,
        stationFavourites: [],
        autoPlayTriggered: false,
        hasAudioChain: false,
        userInteracted: false,

        get playerVolumeModel() {
            return this.playerVolume;
        },
        set playerVolumeModel(value) {
            this.changeVolume(value);
        },

        stationName: computed(() => (api.stationActive ? api.stationActive.name : '')),

        onPlay() {
            if (waveData.animationFrame) {
                window.cancelAnimationFrame(api.animationFrame);
                waveData.animationFrame = 0;
            }

            if (config.setting('showWave')) {
                waveData.animationFrame = window.requestAnimationFrame(animateCanvas);
            }

            // Fade in the station
            waveData.gainNode.gain.cancelScheduledValues(0);
            waveData.gainNode.gain.setValueCurveAtTime(
                [0, api.playerVolume],
                waveData.audioCtx.currentTime,
                2 * api.playerVolume
            );

            if (navigator.mediaSession) {
                navigator.mediaSession.playbackState = 'playing';
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: api.stationActive.name + ' (Kiwi IRC)',
                });
            }
        },

        onPause() {
            if (waveData.animationFrame) {
                window.cancelAnimationFrame(waveData.animationFrame);
                waveData.animationFrame = 0;
            }
            waveData.canvasCtx.clearRect(0, 0, waveData.canvas.width, waveData.canvas.height);
            waveData.canvasCtx.beginPath();

            api.playerPlaying = false;
            if (navigator.mediaSession) {
                navigator.mediaSession.playbackState = 'paused';
            }
        },

        onError() {
            api.stationErrored = true;
            api.playerPlaying = false;

            if (navigator.mediaSession) {
                navigator.mediaSession.playbackState = 'none';
            }
        },

        playStation(_station) {
            let station = _station;

            if (!station) {
                if (this.stationActive) {
                    station = this.stationActive;
                } else {
                    // random station
                    station = this.stationsList[Math.floor(Math.random() * this.stationsList.length)];
                }
            }

            if (!api.hasAudioChain) {
                api.setupAudioChain();
            }

            this.makeStationActive(station);
            this.playerElement.src = station.source;
            this.playerElement.play().catch(() => {});

            this.stationErrored = false;
            this.playerPlaying = true;
        },
        pauseStation() {
            this.playerElement.pause();
            this.playerPlaying = false;
        },
        changeVolume(volume) {
            this.playerVolume = parseFloat(volume);
        },
        toggleMute() {
            if (this.playerVolume === 0) {
                // Player Muted
                this.changeVolume(this.muteVolume === 0 ? config.getSetting('volume') : this.muteVolume);
            } else {
                this.muteVolume = this.playerVolume;
                this.changeVolume(0);
            }
        },
        makeStationActive(station) {
            this.stationActive = station;
            this.stationErrored = false;
            config.setting('active', station.name);
        },
        toggleStarred(station) {
            const starred = config.setting('starred').slice();
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
            config.setting('starred', starred.length > 0 ? starred : null);
        },
        isStarred(station) {
            const starred = config.setting('starred');
            return starred.some((stationName) => stationName === station.name);
        },
        skipStation(direction) {
            // decide if we are skipping through stared or station list
            let stations = this.getStarred();
            if (stations.length <= 1) {
                stations = this.stationsList;
            }

            const stationIdx = this.getStationIdx(stations, this.stationActive);
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

            const station = stations[playIdx];
            if (this.playerPlaying) {
                this.playStation(station);
            } else {
                this.makeStationActive(station);
            }
        },
        getStationIdx(stations, station) {
            if (!station) {
                return -1;
            }
            for (let i = 0; i < stations.length; i++) {
                if (stations[i].name === station.name) {
                    return i;
                }
            }
            return null;
        },
        getActive() {
            const active = config.setting('active');
            if (!active) {
                return '';
            }
            return this.stationsList.find((s) => s.name === active) || null;
        },
        getStarred() {
            const starred = config.setting('starred');
            const out = [];

            starred.forEach((stationName) => {
                const station = this.stationsList.find((s) => s.name === stationName);
                if (station) {
                    out.push(station);
                }
            });
            return out;
        },
        toggleStationsList() {
            const isOpen = !!document.body.querySelector('div.p-radio-browser');
            isOpen ? this.closeStationsList() : this.openStationsList();
        },
        openStationsList() {
            if (config.setting('reloadOnOpen')) {
                this.loadStations(true);
            }
            kiwi.showView('RadioStations');
            if (kiwi.state.ui.is_narrow) {
                kiwi.state.$emit('statebrowser.hide');
            }
        },
        closeStationsList() {
            kiwi.showView(null);
        },
        checkActiveStation() {
            if (this.stationActive) {
                return;
            }

            const active = this.getActive();
            if (active) {
                this.makeStationActive(active);
                return;
            }

            const starred = this.getStarred();
            if (starred.length > 0) {
                this.makeStationActive(starred[0]);
            }
        },
        checkForAutoplay() {
            const autoPlay = config.setting('autoPlay');
            if (!autoPlay || !this.userInteracted) {
                // autoplay disabled or user has not interacted
                return;
            }
            if (this.autoPlayTriggered) {
                // autoplay already triggered
                return;
            }
            if (this.playerElement && this.stationsList.length) {
                this.autoPlayTriggered = true;
                this.playStation();
            }
        },
        setupAudioChain() {
            // Setup the audio chain
            waveData.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audioSource = waveData.audioCtx.createMediaElementSource(this.playerElement);
            waveData.analyser = waveData.audioCtx.createAnalyser();
            audioSource.connect(waveData.analyser);
            waveData.gainNode = waveData.audioCtx.createGain();
            waveData.analyser.connect(waveData.gainNode);
            waveData.gainNode.connect(waveData.audioCtx.destination);
            waveData.analyser.fftSize = 2048;
            waveData.analyser.minDecibels = -180;
            waveData.analyser.maxDecibels = 50;
            waveData.bufferLength = waveData.analyser.frequencyBinCount;
            waveData.dataArray = new Uint8Array(waveData.bufferLength);

            this.hasAudioChain = true;
        },
        async loadStations(force) {
            const url = new URL(config.setting('url'));
            if (force) {
                url.searchParams.set('cb', Date.now());
            }

            /* eslint-disable no-console */
            const rawJSON = await fetch(url)
                .then((r) => {
                    if (!r.ok) {
                        throw new Error(r.status);
                    }
                    return r.text();
                })
                .catch((e) => {
                    console.error('plugin-radio: error loading stations list', e.message);
                });

            if (rawJSON) {
                try {
                    const stationsJSON = kiwi.JSON5.parse(rawJSON);
                    if (Array.isArray(stationsJSON) && stationsJSON.length) {
                        this.stationsList = stationsJSON;
                    } else {
                        console.error('plugin-radio: error stations list is empty');
                    }
                } catch (e) {
                    console.error('plugin-radio: error parsing stations list', e);
                }
            }
            /* eslint-enable no-console */

            this.checkActiveStation();
            this.checkForAutoplay();
        },
    });

    api.loadStations();

    const forceVolume = config.getSetting('forceVolume');
    if (forceVolume) {
        config.setting('volume', config.getSetting('volume'));
    }

    // Set volume from config
    api.playerVolume = config.setting('volume');

    // Watch for volume changes
    watch(
        () => api.playerVolume,
        (newVolume, oldVolume) => {
            if (!api.waveData.gainNode) {
                return;
            }

            const newVolumeFloat = parseFloat(newVolume);
            api.waveData.gainNode.gain.cancelScheduledValues(0);
            if (newVolume !== 0) {
                waveData.gainNode.gain.setValueCurveAtTime(
                    [oldVolume, newVolume],
                    waveData.audioCtx.currentTime,
                    2 * newVolume
                );
            } else {
                api.waveData.gainNode.gain.value = newVolumeFloat;
            }
            config.setting('volume', newVolumeFloat);
        }
    );

    if (navigator.mediaSession) {
        navigator.mediaSession.setActionHandler('play', () => {
            api.playStation();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            api.pauseStation();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            api.skipStation(-1);
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            api.skipStation(1);
        });
    }

    return api;
}
