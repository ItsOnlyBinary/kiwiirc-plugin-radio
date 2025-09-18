/* global kiwi:true */

import hls from 'hls.js/light';

kiwi.plugin('plugin-radio-hls', (kiwi, logger) => {
    if (!hls.isSupported()) {
        return;
    }
    kiwi.pluginRadio.registerTypeHandler('hls', handleHLSStream);
});

/**
 * Handle HLS stream.
 * Sets up an HLS stream using hls.js.
 * @param {Object} station - The station to play
 */
function handleHLSStream(station) {
    const decoder = new TextDecoder();
    const hlsInstance = new hls({
        enableWorker: true,
        workerPath: kiwi.state.getSetting('settings.plugin-radio.hlsWorkerURL'),
        xhrSetup: (xhr, url) => {
            xhr.withCredentials = false;
        },
        debug: false,
    });

    hlsInstance.loadSource(station.source);
    hlsInstance.attachMedia(this.playerElement);
    hlsInstance.on(hls.Events.MANIFEST_PARSED, () => {
        this.playerElement.play().catch(() => {});
    });

    hlsInstance.on(hls.Events.FRAG_PARSING_METADATA, (event, data) => {
        data.samples.forEach((sample) => {
            const text = decoder.decode(sample.data);
            const match = this.streamTitleRegex.exec(text);
            if (match) {
                this.songTitle = match[1] || '';
            }
        });
    });

    hlsInstance.on(hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
            this.stationErrored = true;

            /* eslint-disable no-console */
            switch (data.type) {
            case hls.ErrorTypes.NETWORK_ERROR:
                console.error('[plugin-radio] HLS network error');
                break;
            case hls.ErrorTypes.MEDIA_ERROR:
                console.error('[plugin-radio] HLS media error');
                break;
            default:
                console.error('[plugin-radio] HLS other error');
            }

            /* eslint-enable no-console */
        }
    });

    this.fetchShutdown = () => {
        if (hlsInstance) {
            this.mediaSource = null;
            this.fetchShutdown = null;
            hlsInstance.destroy();
        }
    };
}
