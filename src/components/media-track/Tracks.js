import { useVideoContext } from '@/hooks/VideoContext';
import { useEffect, useRef } from 'react';

export default function Tracks({ videoTrack, audioTrack, isMainParticipant, addAudioTrack }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const { setMainParticipantVideoRef } = useVideoContext();

  useEffect(() => {
    if (isMainParticipant) {
      setMainParticipantVideoRef(videoRef);
    }
  }, [isMainParticipant, setMainParticipantVideoRef]);

  useEffect(() => {
    let elVideo = videoRef.current;
    let elAudio = audioRef.current;
    videoTrack.attach(elVideo);
    audioTrack.attach(elAudio);
    addAudioTrack(audioTrack.mediaStreamTrack);
    return () => {
      videoTrack.detach(elVideo);
      audioTrack.detach(elAudio);

      elVideo.srcObject = null;
      elAudio.srcObject = null;
    };
  }, [videoTrack, audioTrack, addAudioTrack]);

  return isMainParticipant ? (
    <>
      <video ref={videoRef} className="w-full h-[60%]" />
      <audio ref={audioRef} muted={false}></audio>
    </>
  ) : (
    <>
      <video ref={videoRef} className="rounded-md w-[100vw] left-0  h-36" />
      <audio ref={audioRef} muted={false}></audio>
    </>
  );
}
