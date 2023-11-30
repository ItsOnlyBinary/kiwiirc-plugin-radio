export default function useEqualizer() {
    const waveData = {
        audioCtx: null,
        analyser: null,
        gainNode: null,
        canvas: null,
        canvasCtx: null,
        bufferLength: 0,
        dataArray: null,
        animationFrame: 0,
    };

    function animateCanvas() {
        waveData.canvasCtx.clearRect(0, 0, waveData.canvas.width, waveData.canvas.height);
        waveData.canvasCtx.lineWidth = 2;
        waveData.canvasCtx.strokeStyle = '#42b99280';
        waveData.canvasCtx.beginPath();

        const sliceWidth = (waveData.canvas.width * 1.0) / waveData.bufferLength;
        waveData.analyser.getByteTimeDomainData(waveData.dataArray);

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

        waveData.canvasCtx.lineTo(waveData.canvas.width, waveData.canvas.height / 2);
        waveData.canvasCtx.stroke();

        if (waveData.animationFrame) {
            waveData.animationFrame = window.requestAnimationFrame(animateCanvas);
        } else {
            waveData.canvasCtx.clearRect(0, 0, waveData.canvas.width, waveData.canvas.height);
            waveData.canvasCtx.beginPath();
        }
    }

    return {
        waveData,
        animateCanvas,
    };
}
