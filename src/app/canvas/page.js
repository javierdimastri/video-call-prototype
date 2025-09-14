"use client"
import { useEffect, useRef, useState } from 'react';
import CanvasRecorder from '../../utils/CanvasRecorder';

const loadCanvasRecorder = () =>
  import('../../utils/CanvasRecorder');

const CanvasRecorderComponent = () => {
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const loadRecorder = async () => {
      try {
        await loadCanvasRecorder(); // Load script CanvasRecorder secara dinamis

        const canvas = canvasRef.current;

        // Example: Draw something on the canvas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('Recording Canvas...', 50, 50);

        // Initialize CanvasRecorder
        recorderRef.current = new CanvasRecorder(canvas, {
          disableLogs: false,
        });
      } catch (error) {
        console.error('Failed to load CanvasRecorder', error);
      }
    };

    loadRecorder();

    return () => {
      if (recorderRef.current) {
        recorderRef.current = null;
      }
    };
  }, []);

  const startRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.record();
      setIsRecording(true);
      console.log('Recording started');
    }
  };

  const stopRecording = () => {
    console.log({ recorderRef });

    if (recorderRef.current) {
      recorderRef.current.stop((blob) => {
        const url = URL.createObjectURL(blob);
        canvasRef.src = URL.createObjectURL(blob);
        console.log({blob});
        
        window.open(url);
        setIsRecording(false);
        console.log('Recording stopped');
      });
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={640} height={360} style={{ border: '1px solid black' }}></canvas>
      <div>
        <button onClick={startRecording} disabled={isRecording}>Start</button>
        <button onClick={stopRecording} disabled={!isRecording}>Stop</button>
      </div>
    </div>
  );
};

export default CanvasRecorderComponent;
