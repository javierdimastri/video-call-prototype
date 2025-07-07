import { useEffect, useRef } from 'react';
import { connect } from 'twilio-video';

const Video = ({ roomId, userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    let room;

    const joinRoom = async () => {
      try {
        const response = await fetch(`/api/token/${roomId}?userId=${userId}`);
        const { token } = await response.json();

        room = await connect(token, { name: roomId });
        console.log({ room });

        if (!room) return;

        // Attach local track
        room.localParticipant.videoTracks.forEach(publication => {
          const track = publication.track;
          if (track && localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
            const el = track.attach();
            el.id = `local-${track.sid}`;
            localVideoRef.current.appendChild(el);
            console.log('Remote video element attached:', el);
          }
        });

        const attachRemoteTrack = (track) => {
          if (track.kind === 'video' && remoteVideoRef.current) {
            const el = track.attach();
            el.id = `remote-${track.sid}`;
            remoteVideoRef.current.innerHTML = ''; // Hanya tampilkan 1 remote
            remoteVideoRef.current.appendChild(el);
            console.log('Remote video element attached:', el); // debug
          }
        };

        const detachRemoteTrack = (track) => {
          const element = document.getElementById(`remote-${track.sid}`);
          if (element) element.remove();
          track.detach().forEach(el => el.remove());
        };

        room.participants.forEach(participant => {
          participant.tracks.forEach(pub => {
            if (pub.isSubscribed) attachRemoteTrack(pub.track);
          });
          participant.on('trackSubscribed', attachRemoteTrack);
          participant.on('trackUnsubscribed', detachRemoteTrack);
        });

        room.on('participantConnected', participant => {
          participant.on('trackSubscribed', attachRemoteTrack);
          participant.on('trackUnsubscribed', detachRemoteTrack);
        });

        room.on('participantDisconnected', participant => {
          participant.tracks.forEach(pub => {
            if (pub.track) detachRemoteTrack(pub.track);
          });
        });

      } catch (err) {
        console.error('Failed to connect to room', err);
      }
    };

    joinRoom();

    return () => {
      if (room) {
        room.localParticipant.tracks.forEach(pub => {
          if (pub.track) {
            pub.track.stop();
            pub.track.detach().forEach(el => el.remove());
          }
        });
        room.disconnect();
      }
    };
  }, [roomId, userId]);

  // PiP trigger handler
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
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row space-x-4">
        <div ref={localVideoRef} className="local-video" />
        <div ref={remoteVideoRef} className="remote-video" />
      </div>
      <button
        onClick={handlePiP}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Toggle PiP Mode
      </button>
    </div>
  );
};

export default Video;
