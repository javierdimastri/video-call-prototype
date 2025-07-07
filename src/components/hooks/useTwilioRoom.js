import { useEffect, useRef } from 'react';
import { connect } from 'twilio-video';

export function useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef) {
  const roomRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const joinRoom = async () => {
      try {
        const res = await fetch(`/api/token/${roomId}?userId=${userId}`);
        const { token } = await res.json();

        const room = await connect(token, { name: roomId });
        if (!isMounted) return;

        console.log('Connected to room:', room.name);
        roomRef.current = room;

        // Attach local video
        room.localParticipant.videoTracks.forEach(pub => {
          const track = pub.track;
          if (track && localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
            const el = track.attach();
            el.id = `local-${track.sid}`;
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.objectFit = 'cover';
            localVideoRef.current.appendChild(el);
            console.log('Lokal video element attached:', el);
          }
        });

        const attachRemote = (track) => {
          if (track.kind === 'video' && remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = '';
            const el = track.attach();
            el.id = `remote-${track.sid}`;
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.objectFit = 'cover';
            remoteVideoRef.current.appendChild(el);
            console.log('Remote video element attached:', el);
          }
        };

        const detachRemote = (track) => {
          if (track.kind === 'video') {
            const el = document.getElementById(`remote-${track.sid}`);
            if (el) el.remove();
            track.detach().forEach(e => e.remove());
          }
        };

        // Existing participants
        room.participants.forEach(p => {
          p.tracks.forEach(pub => {
            if (pub.isSubscribed) attachRemote(pub.track);
          });
          p.on('trackSubscribed', attachRemote);
          p.on('trackUnsubscribed', detachRemote);
        });

        // New participants
        room.on('participantConnected', p => {
          console.log('Participant connected:', p.identity);
          p.on('trackSubscribed', attachRemote);
          p.on('trackUnsubscribed', detachRemote);
        });

        room.on('participantDisconnected', p => {
          console.log('Participant disconnected:', p.identity);
          p.tracks.forEach(pub => {
            if (pub.track) detachRemote(pub.track);
          });
        });

      } catch (err) {
        console.error('Failed to connect to room:', err);
      }
    };

    joinRoom();

    return () => {
      isMounted = false;
      const room = roomRef.current;
      if (room) {
        console.log('Cleaning up room:', room.name);
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
}
