'use client';
import { Suspense } from 'react';
import VideoCallLayout from '@/components/video-call/VideoCallLayoutExt';

export default function VideoCall() {
    return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoCallLayout />
    </Suspense>
  );
}
