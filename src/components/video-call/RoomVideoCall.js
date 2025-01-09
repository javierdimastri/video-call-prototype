import { useEffect, useState } from 'react';
import ParticipantList from './ParticipantList';
import useRecorder from '../../hooks/useRecorder'; // Pastikan path sesuai dengan lokasi hook

export default function RoomVideoCall({ addAudioTrack }) {
  const [screenStream, setScreenStream] = useState(null);
  const [audioTracks, setAudioTracks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const { startRecording, stopRecording, initMediaStream } = useRecorder(screenStream, audioTracks);

  useEffect(() => {
    initMediaStream(); // Initialize camera and microphone when component mounts
  }, [initMediaStream]);

  const handleStartRecording = async () => {
    await startRecording();
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    setIsRecording(false);

    // Optional: Save the recording
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'recording.webm';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('Recording saved');
  };
  return (
    <div className="w-full">
      <div className="h-[100vh] w-[100vh] block relative" data-testid={'participant-video-display-screen'}>
        <ParticipantList addAudioTrack={addAudioTrack} />
      </div>
      {/* Tombol kontrol untuk rekaman */}
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


// import React, { useEffect, useState } from 'react';
// import useRecorder from './useRecorder';

// export default function RoomVideoCall() {
//   const { initMediaStream, startRecording, stopRecording, mediaStream } = useRecorder();
//   const [isRecording, setIsRecording] = useState(false);

//   useEffect(() => {
//     initMediaStream(); // Initialize camera and microphone when component mounts
//   }, [initMediaStream]);

//   const handleStart = async () => {
//     await startRecording();
//     setIsRecording(true);
//   };

//   const handleStop = async () => {
//     const blob = await stopRecording();
//     setIsRecording(false);

//     // Optional: Save the recording
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.style.display = 'none';
//     a.href = url;
//     a.download = 'recording.webm';
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     console.log('Recording saved');
//   };

//   return (
//     <div className="w-full">
//       <div className="h-[100vh] w-[100vh] block relative">
//         {mediaStream && (
//           <video
//             autoPlay
//             playsInline
//             muted
//             ref={(video) => {
//               if (video) video.srcObject = mediaStream;
//             }}
//             className="absolute inset-0 w-full h-full"
//           />
//         )}
//         <button
//           onClick={isRecording ? handleStop : handleStart}
//           className="bg-blue-500 text-white p-2 rounded mt-4"
//         >
//           {isRecording ? 'Stop Recording' : 'Start Recording'}
//         </button>
//       </div>
//     </div>
//   );
// }
