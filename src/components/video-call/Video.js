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

      // Attach local tracks
      room.localParticipant.videoTracks.forEach(publication => {
        const track = publication.track;
        if (track && localVideoRef.current) {
          localVideoRef.current.innerHTML = ''; // Bersihkan
          const el = track.attach();
          el.id = `local-${track.sid}`;
          localVideoRef.current.appendChild(el);
        }
      });

      // Function untuk attach remote video
      const attachRemoteTrack = (track) => {
        if (track.kind === 'video' && remoteVideoRef.current) {
          const el = track.attach();
          el.id = `remote-${track.sid}`;
          remoteVideoRef.current.appendChild(el);
        }
      };

      // Function untuk detach remote video
      const detachRemoteTrack = (track) => {
        const element = document.getElementById(`remote-${track.sid}`);
        if (element) element.remove();
        track.detach().forEach(el => el.remove());
      };

      // Handle existing participants
      room.participants.forEach(participant => {
        participant.tracks.forEach(pub => {
          if (pub.isSubscribed) attachRemoteTrack(pub.track);
        });

        participant.on('trackSubscribed', attachRemoteTrack);
        participant.on('trackUnsubscribed', detachRemoteTrack);
      });

      // New participants
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


  return (
    <div className="flex flex-row space-x-4">
      <div ref={localVideoRef} className="local-video" />
      <div ref={remoteVideoRef} className="remote-video" />
    </div>
  );
};

export default Video;
