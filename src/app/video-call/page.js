'use client';
import { Suspense } from 'react';
import VideoCallLayout from '@/components/video-call/VideoCallLayout';

export default function VideoCall() {
    return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoCallLayout />
    </Suspense>
  );
}
