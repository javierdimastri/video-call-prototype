'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import VideoIcon from '../../../public/assets/video-call-icon.svg';
import { rubik } from '../../ui/fonts';
import Header from '@/components/Header';
import Video from '@/components/video-call/Video';

const VideoCallLayout = () => {
const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    let timeout;
    if (!roomId || roomId === '') {
      timeout = setTimeout(() => {
        setShowError(false);
        router.push('/');
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [roomId, router]);

  if (!roomId || roomId === '' || !userId || userId === '') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 dashboard-background">
        {showError && (
          <div className="z-10 max-w-5xl w-full font-mono text-sm lg:flex">
            <Header />
            <div className="text-center w-full mt-16">
              <p className="text-lg animate-blink">opps roomId and userId is required....</p>
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
        <div className="text-center w-full mt-16 flex flex-row items-center justify-center space-x-4">
          <Video roomId={roomId} userId={userId}/>
        </div>
      </div>
    </div>
  );
};

export default VideoCallLayout;