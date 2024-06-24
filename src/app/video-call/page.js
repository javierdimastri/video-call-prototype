'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import VideoIcon from '../../../public/assets/video-call-icon.svg';
import { rubik } from '../../ui/fonts';
import Header from '@/components/Header';
import Video from '@/components/video-call/Video';

export default function VideoCall() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const [showError, setShowError] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    let timeout;
    if (!roomId || roomId === '') {
      timeout = setTimeout(() => {
        setShowError(false);
        router.push('/');
      }, 3000); // 3000 milliseconds = 3 detik
    }

    return () => clearTimeout(timeout);
  }, [roomId, router]);

  console.log({videoRef});

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

  if (!roomId || roomId === '') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 dashboard-background">
        {showError && (
          <div className="z-10 max-w-5xl w-full font-mono text-sm lg:flex">
            <Header />
            <div className="text-center w-full mt-16">
              <p className="text-lg animate-blink">opps roomId is required....</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 dashboard-background">
      <div className="z-10 max-w-5xl w-full font-mono text-sm lg:flex">
        <div className={`w-full absolute top-0 left-0 flex items-center p-4 pl-11 bg-customBlue`}>
          <Image src={VideoIcon} alt="Video Call Icon" className={`h-10 w-10 mr-2 ${rubik.className}`} />
          <p className={`text-2xl ${rubik.className} pl-4`}>|</p>
          <p className={`text-2xl ${rubik.className} pl-4`}>Room {roomId}</p>
        </div>
        {/* <div className="text-center w-full mt-16">
          { !videoRef.current && <p className="text-lg">Video call for room {roomId} will be implemented here.</p> }
          <video ref={videoRef} autoPlay className="mt-4 border border-gray-300 rounded-lg shadow-lg"></video>
        </div> */}
        <div className="text-center w-full mt-16 flex flex-row items-center justify-center space-x-4">
          <Video />
          <Video/>
        </div>
      </div>
    </div>
  );
}
