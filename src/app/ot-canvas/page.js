'use client'
import { useEffect, useRef, useState } from 'react';

const App = () => {
  const [recording, setRecording] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [isBackCamera, setIsBackCamera] = useState(false); // Untuk menyimpan status kamera
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isBackCamera ? "environment" : "user", // "environment" untuk kamera belakang, "user" untuk kamera depan
          },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isBackCamera]); // Re-run useEffect ketika status kamera berubah

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const combinedStream = new MediaStream([
        ...displayStream.getTracks(),
        ...streamRef.current.getTracks(),
      ]);

      const options = { mimeType: 'video/webm;codecs=vp9' };
      const recorder = new MediaRecorder(combinedStream, options);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoSrc(URL.createObjectURL(blob));
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setRecording(false);
    }
  };

  // Fungsi untuk beralih kamera
  const switchCamera = async () => {
    setIsBackCamera(!isBackCamera); // Toggle status kamera
    if (streamRef.current) {
      // Matikan track lama sebelum menggantinya
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">Video Recording App</h1>
      <div className="border border-gray-300 rounded-lg p-2 w-64 h-64 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Stop Recording
          </button>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={switchCamera}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Switch Camera
        </button>
      </div>

      {videoSrc && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Recorded Video</h2>
          <video src={videoSrc} controls className="w-full"></video>
        </div>
      )}
    </div>
  );
};

export default App;
