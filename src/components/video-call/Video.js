import { useRef } from 'react';
import { useTwilioRoom } from '../hooks/useTwilioRoom';

const Video = ({ roomId, userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef);

  const handlePiP = async () => {
    if (!document.pictureInPictureEnabled) {
      alert("Picture-in-Picture is not supported on this browser.");
      return;
    }

    const videoEl = remoteVideoRef.current?.querySelector('video');
    if (videoEl) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoEl.requestPictureInPicture();
        }
      } catch (err) {
        console.error("Failed to toggle PiP", err);
      }
    } else {
      console.log("No remote video element available for PiP");
    }
  };

  return (
<div className="flex flex-col items-center space-y-4 p-2 w-full h-full">
  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 w-full max-w-screen-md">
    <div
      ref={localVideoRef}
      className="bg-black sm:w-1/3 aspect-video rounded overflow-hidden"
    />
    <div
      ref={remoteVideoRef}
      className="bg-black w-full sm:w-2/3 aspect-video rounded overflow-hidden"
    />
  </div>

  <button
    onClick={handlePiP}
    className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition disabled:opacity-50"
  >
    Toggle PiP Mode
  </button>
</div>

  );
};

export default Video;
