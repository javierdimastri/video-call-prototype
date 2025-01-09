import { useVideoContext } from '@/hooks/VideoContext';
import { useState } from 'react';
import useRecorder from '../../hooks/useRecorderMod';
import ParticipantList from './ParticipantList';

export default function RoomVideoCallMod({ addAudioTrack }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasStream, setCanvasStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Gunakan dua instance useRecorder
  const { startRecording: startLocalRecording, stopRecording: stopLocalRecording } = useRecorder();
  const { startRecording: startRemoteRecording, stopRecording: stopRemoteRecording } = useRecorder();
  
  const { room } = useVideoContext();

  const mergeStreams = (videoStreams, audioStreams) => {
    const mediaStream = new MediaStream();
    videoStreams.forEach((videoTrack) => mediaStream.addTrack(videoTrack));
    audioStreams.forEach((audioTrack) => mediaStream.addTrack(audioTrack));
    return mediaStream;
  };

  const handleStartRecording = async () => {
    const localVideoStreams = [];
    const localAudioStreams = [];
    const remoteVideoStreams = [];
    const remoteAudioStreams = [];

    // Ambil track dari local participant
    room.localParticipant.audioTracks.forEach((publication) => {
      if (publication.track) {
        localAudioStreams.push(publication.track.mediaStreamTrack);
      }
    });
    room.localParticipant.videoTracks.forEach((publication) => {
      if (publication.track) {
        localVideoStreams.push(publication.track.mediaStreamTrack);
      }
    });

    // Ambil track dari remote participants
    room.participants.forEach((participant) => {
      participant.audioTracks.forEach((publication) => {
        if (publication.track) {
          remoteAudioStreams.push(publication.track.mediaStreamTrack);
        }
      });
      participant.videoTracks.forEach((publication) => {
        if (publication.track) {
          remoteVideoStreams.push(publication.track.mediaStreamTrack);
        }
      });
    });

    // Gabungkan local dan remote streams
    const localStream = mergeStreams(localVideoStreams, localAudioStreams);
    const remoteStream = mergeStreams(remoteVideoStreams, remoteAudioStreams);

    // Mulai merekam masing-masing stream
    await startLocalRecording(localStream);
    await startRemoteRecording(remoteStream);

    setIsRecording(true);
    console.log('Recording started for local and remote streams.');
  };

  const handleStopRecording = async () => {
    // Stop recording untuk local dan remote streams
    const localBlob = await stopLocalRecording();
    const remoteBlob = await stopRemoteRecording();

    setIsRecording(false);

    // Simpan file untuk local recording
    const localUrl = URL.createObjectURL(localBlob);
    const localLink = document.createElement('a');
    localLink.style.display = 'none';
    localLink.href = localUrl;
    localLink.download = `local-recording-${Date.now()}.webm`;
    document.body.appendChild(localLink);
    localLink.click();
    window.URL.revokeObjectURL(localUrl);

    // Simpan file untuk remote recording
    const remoteUrl = URL.createObjectURL(remoteBlob);
    const remoteLink = document.createElement('a');
    remoteLink.style.display = 'none';
    remoteLink.href = remoteUrl;
    remoteLink.download = `remote-recording-${Date.now()}.webm`;
    document.body.appendChild(remoteLink);
    remoteLink.click();
    window.URL.revokeObjectURL(remoteUrl);

    console.log('Recording saved for both local and remote streams.');
  };

  return (
    <div className="w-full">
      <div className="h-[100vh] w-[100vh] block relative">
        <ParticipantList addAudioTrack={addAudioTrack} />
      </div>
      <div className="flex justify-center mt-5">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
}
