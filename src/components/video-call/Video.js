'use client';
import { useRef, useEffect } from 'react';

export default function Video() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Error accessing webcam: ", err);
        });
    }
  }, []);

  return (
    <video ref={videoRef} autoPlay className="mt-4 border border-gray-300 rounded-lg shadow-lg"></video>
  );
}
