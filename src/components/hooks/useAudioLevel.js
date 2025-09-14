import { useEffect, useState } from "react";

export function useAudioLevel(track) {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!track) return;

    // Buat elemen audio (hidden) dan attach track
    const audioEl = track.attach();
    audioEl.style.display = "none";
    document.body.appendChild(audioEl);

    // Context Web Audio API
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioEl.srcObject);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    let rafId;
    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      // Hitung rata-rata energi suara
      const values = dataArray.reduce((a, b) => a + b, 0);
      const avg = values / dataArray.length;
      setAudioLevel(avg); // nilai 0–255
      rafId = requestAnimationFrame(updateLevel);
    };
    updateLevel();

    return () => {
      cancelAnimationFrame(rafId);
      track.detach().forEach(el => el.remove());
      audioContext.close();
    };
  }, [track]);

  return audioLevel;
}
