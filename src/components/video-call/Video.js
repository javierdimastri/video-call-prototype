import { useRef, useState, useEffect } from 'react';
import { useTwilioRoom } from '../hooks/useTwilioRoom';

const Video = ({ roomId, userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const { roomRef, dominantSpeaker, participants } = useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef);

  // Debug logging for dominant speaker changes
  useEffect(() => {
    if (dominantSpeaker) {
      console.log('🎙️ Dominant speaker updated:', {
        identity: dominantSpeaker.identity,
        sid: dominantSpeaker.sid,
        isLocal: participants.get(dominantSpeaker.sid)?.isLocal
      });
    } else {
      console.log('🔇 No dominant speaker');
    }
  }, [dominantSpeaker, participants]);

  const toggleAudio = () => {
    const room = roomRef.current;
    if (!room) return;

    room.localParticipant.audioTracks.forEach(pub => {
      if (isAudioMuted) {
        pub.track.enable();
        console.log('Audio unmuted');
      } else {
        pub.track.disable();
        console.log('Audio muted');
      }
    });
    setIsAudioMuted(!isAudioMuted);
  };

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

  // Check if local participant is dominant speaker
  const isLocalDominant = dominantSpeaker && participants.get(dominantSpeaker.sid)?.isLocal;
  const dominantSpeakerName = dominantSpeaker ? dominantSpeaker.identity : null;

  return (
<div className="flex flex-col items-center space-y-4 p-2 w-full h-full">
  {/* Dominant Speaker Indicator */}
  <div className="text-center mb-2">
    {dominantSpeaker ? (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-sm">
        🎙️ <strong>Dominant Speaker:</strong> {dominantSpeakerName}
      </div>
    ) : (
      <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg shadow-sm">
        🔇 No active speaker detected
      </div>
    )}
  </div>

  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 w-full max-w-screen-md">
    <div className="relative">
      <div
        ref={localVideoRef}
        className={`bg-black sm:w-1/3 aspect-video rounded overflow-hidden transition-all duration-300 ${
          isLocalDominant ? 'ring-4 ring-green-400 shadow-lg' : ''
        }`}
      />
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        You {isLocalDominant ? '🎙️' : ''}
      </div>
    </div>
    <div className="relative">
      <div
        ref={remoteVideoRef}
        className={`bg-black w-full sm:w-2/3 aspect-video rounded overflow-hidden transition-all duration-300 ${
          dominantSpeaker && !isLocalDominant ? 'ring-4 ring-green-400 shadow-lg' : ''
        }`}
      />
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        Remote {dominantSpeaker && !isLocalDominant ? '🎙️' : ''}
      </div>
    </div>
  </div>

  {/* Participants List */}
  <div className="w-full max-w-screen-md">
    <h3 className="text-lg font-semibold mb-2 text-center">Participants ({participants.size})</h3>
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      {Array.from(participants.values()).map(({ participant, isLocal, identity }) => {
        const isSpeaking = dominantSpeaker && dominantSpeaker.sid === participant.sid;
        return (
          <div
            key={participant.sid}
            className={`flex items-center justify-between p-2 rounded transition-all duration-300 ${
              isSpeaking 
                ? 'bg-green-100 border border-green-300' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <span className="font-medium">
              {identity} {isLocal ? '(You)' : ''}
            </span>
            <div className="flex items-center space-x-2">
              {isSpeaking ? (
                <span className="text-green-600 text-sm animate-pulse">
                  🎙️ Speaking
                </span>
              ) : (
                <span className="text-gray-400 text-sm">
                  🔇 Quiet
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>

  <div className="flex space-x-4">
    <button
      onClick={toggleAudio}
      className={`px-4 py-2 rounded shadow transition ${
        isAudioMuted 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      {isAudioMuted ? '🔇 Unmute' : '🔊 Mute'}
    </button>
    <button
      onClick={handlePiP}
      className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition disabled:opacity-50"
    >
      Toggle PiP Mode
    </button>
  </div>
</div>

  );
};

export default Video;
