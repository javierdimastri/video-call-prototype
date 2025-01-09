import { useState } from 'react';
import { useVideoContext } from '@/hooks/VideoContext';
import useRecorder from '../../hooks/useRecorderMod';
import ParticipantList from './ParticipantList';
import {VideoStreamMerger} from 'video-stream-merger';

export default function RoomVideoCallMod({ addAudioTrack }) {
  const [isRecording, setIsRecording] = useState(false);

  const { startRecording: startMergedRecording, stopRecording: stopMergedRecording } = useRecorder();
  const { room } = useVideoContext();

  const handleStartRecording = async () => {
    // Buat merger
    const merger = new VideoStreamMerger({
      width: 1280,
      height: 720,
      fps: 30,
    });

    // Ambil track dari local participant
    const localVideoTracks = [];
    const localAudioTracks = [];
    room.localParticipant.videoTracks.forEach((publication) => {
      if (publication.track) {
        localVideoTracks.push(publication.track.mediaStreamTrack);
      }
    });
    room.localParticipant.audioTracks.forEach((publication) => {
      if (publication.track) {
        localAudioTracks.push(publication.track.mediaStreamTrack);
      }
    });

    // Ambil track dari remote participants
    const remoteVideoTracks = [];
    const remoteAudioTracks = [];
    room.participants.forEach((participant) => {
      participant.videoTracks.forEach((publication) => {
        if (publication.track) {
          remoteVideoTracks.push(publication.track.mediaStreamTrack);
        }
      });
      participant.audioTracks.forEach((publication) => {
        if (publication.track) {
          remoteAudioTracks.push(publication.track.mediaStreamTrack);
        }
      });
    });

    // Tambah local dan remote video ke merger
    localVideoTracks.forEach((track, index) => {
      merger.addStream(new MediaStream([track]), {
        x: index * 640, // Atur posisi video di canvas
        y: 0,
        width: 640,
        height: 360,
        mute: true,
      });
    });

    remoteVideoTracks.forEach((track, index) => {
      merger.addStream(new MediaStream([track]), {
        x: (index + 1) * 640,
        y: 0,
        width: 640,
        height: 360,
        mute: true,
      });
    });

    // Tambah audio ke merger
    [...localAudioTracks, ...remoteAudioTracks].forEach((track) => {
      merger.addStream(new MediaStream([track]), { mute: false });
    });

    // Start merger
    merger.start();
    const mergedStream = merger.result;
    await startMergedRecording(mergedStream);

    setIsRecording(true);
    console.log('Recording started for merged streams.');
  };

  const handleStopRecording = async () => {
    // Stop recording dan simpan file
    const mergedBlob = await stopMergedRecording();
    setIsRecording(false);

    const mergedUrl = URL.createObjectURL(mergedBlob);
    const mergedLink = document.createElement('a');
    mergedLink.style.display = 'none';
    mergedLink.href = mergedUrl;
    mergedLink.download = `merged-recording-${Date.now()}.webm`;
    document.body.appendChild(mergedLink);
    mergedLink.click();
    URL.revokeObjectURL(mergedUrl);

    console.log('Merged recording saved.');
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
