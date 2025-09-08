/**
 * Equalizer module for visualizing audio waveforms
 * @returns {Object} - Equalizer API with waveData and animateCanvas
 */
export default function useEqualizer() {
    /**
     * Wave data object containing audio context and canvas information
     * @type {Object}
     */
    const waveData = {
        audioCtx: null, // Audio context
        analyser: null, // Analyser node
        gainNode: null, // Gain node
        canvas: null, // Canvas element
        canvasCtx: null, // Canvas context
        bufferLength: 0, // Buffer length
        dataArray: null, // Data array for waveform
        animationFrame: 0, // Animation frame ID
    };

    /**
     * Animate the canvas with audio waveform
     */
    function animateCanvas() {
        // Clear the canvas
        waveData.canvasCtx.clearRect(0, 0, waveData.canvas.width, waveData.canvas.height);

        // Set canvas styles
        waveData.canvasCtx.lineWidth = 2;
        waveData.canvasCtx.strokeStyle = '#42b99280';
        waveData.canvasCtx.beginPath();

        // Calculate slice width
        const sliceWidth = (waveData.canvas.width * 1.0) / waveData.bufferLength;

        // Get audio data
        waveData.analyser.getByteTimeDomainData(waveData.dataArray);

        // Draw waveform
        let x = 0;
        for (let i = 0; i < waveData.bufferLength; i++) {
            const v = waveData.dataArray[i] / 128.0;
            const y = (v * waveData.canvas.height) / 2;

            if (i === 0) {
                waveData.canvasCtx.moveTo(x, y);
            } else {
                waveData.canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        // Complete the waveform
        waveData.canvasCtx.lineTo(waveData.canvas.width, waveData.canvas.height / 2);
        waveData.canvasCtx.stroke();

        // Continue animation
        if (waveData.animationFrame) {
            waveData.animationFrame = window.requestAnimationFrame(animateCanvas);
        } else {
            waveData.canvasCtx.clearRect(0, 0, waveData.canvas.width, waveData.canvas.height);
            waveData.canvasCtx.beginPath();
        }
    }

    /**
     * Return the equalizer API
     * @returns {Object} - Equalizer API
     */
    return {
        waveData,
        animateCanvas,
    };
}
