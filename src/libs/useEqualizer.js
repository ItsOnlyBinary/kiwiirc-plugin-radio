/**
 * Equalizer module for visualizing audio waveforms
 * This module provides functionality for visualizing audio waveforms using the Web Audio API
 * @returns {Object} - Equalizer API with waveData and animateCanvas
 */
export default function useEqualizer() {
    /**
     * Wave data object containing all necessary properties for audio visualization
     * This object holds references to the audio context, canvas, and related data
     * @type {Object}
     */
    const waveData = {
        audioCtx: null, // Audio context for processing audio
        analyser: null, // Analyser node for analyzing audio data
        gainNode: null, // Gain node for controlling volume
        canvas: null, // Canvas element for drawing the waveform
        canvasCtx: null, // Canvas context for drawing operations
        bufferLength: 0, // Length of the data buffer
        dataArray: null, // Array to hold audio data
        animationFrame: 0, // ID of the current animation frame
    };

    /**
     * Animate the canvas with audio waveform
     * This function continuously updates the canvas to visualize the audio waveform
     * It uses requestAnimationFrame for smooth animations
     */
    function animateCanvas() {
        // Clear the canvas for the next frame
        waveData.canvasCtx.clearRect(0, 0, waveData.canvas.width, waveData.canvas.height);

        // Set canvas styles for the waveform
        waveData.canvasCtx.lineWidth = 2;
        waveData.canvasCtx.strokeStyle = '#42b99280'; // Semi-transparent green
        waveData.canvasCtx.beginPath();

        // Calculate the width of each slice in the waveform
        const sliceWidth = (waveData.canvas.width * 1.0) / waveData.bufferLength;

        // Get the current audio data from the analyser
        waveData.analyser.getByteTimeDomainData(waveData.dataArray);

        // Draw the waveform on the canvas
        let x = 0;
        for (let i = 0; i < waveData.bufferLength; i++) {
            // Convert data to a value between -1 and 1
            const v = waveData.dataArray[i] / 128.0;
            // Convert to pixel value for canvas height
            const y = (v * waveData.canvas.height) / 2;

            // Draw the line for this slice
            if (i === 0) {
                waveData.canvasCtx.moveTo(x, y);
            } else {
                waveData.canvasCtx.lineTo(x, y);
            }

            // Move to the next slice position
            x += sliceWidth;
        }

        // Complete the waveform path
        waveData.canvasCtx.lineTo(waveData.canvas.width, waveData.canvas.height / 2);
        waveData.canvasCtx.stroke();

        // Continue the animation loop
        if (waveData.animationFrame) {
            waveData.animationFrame = window.requestAnimationFrame(animateCanvas);
        } else {
            // If no animation frame is active, clear and reset the canvas
            waveData.canvasCtx.clearRect(0, 0, waveData.canvas.width, waveData.canvas.height);
            waveData.canvasCtx.beginPath();
        }
    }

    /**
     * Return the equalizer API
     * This function exposes the waveData and animateCanvas functions for external use
     * @returns {Object} - Equalizer API with waveData and animateCanvas
     */
    return {
        waveData,
        animateCanvas,
    };
}
