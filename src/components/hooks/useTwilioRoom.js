import { useCallback, useEffect, useRef } from 'react';
import { connect } from 'twilio-video';

export function useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef) {
  const roomRef = useRef(null);
  const attachRemoteRef = useRef(() => {});

  useEffect(() => {
    let isMounted = true;
    const remoteContainer = remoteVideoRef.current;

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

        const attachRemote = (track, force = false) => {
          const container = remoteVideoRef.current;
          if (!container || track.kind !== 'video') return;

          const isOverride = container.dataset.override === 'true';
          if (!force && isOverride) {
            console.log('Remote override active, skipping remote track attach');
            return;
          }

          let videoEl = container.querySelector('video');
          if (!videoEl) {
            videoEl = document.createElement('video');
            container.appendChild(videoEl);
          }

          container.dataset.override = 'false';

          Array.from(container.childNodes).forEach(node => {
            if (node !== videoEl) node.remove();
          });

          videoEl.removeAttribute('src');
          videoEl.srcObject = null;
          videoEl.autoplay = true;
          videoEl.loop = false;
          videoEl.controls = false;
          videoEl.setAttribute('playsinline', '');
          videoEl.style.width = '100%';
          videoEl.style.height = '100%';
          videoEl.style.objectFit = 'cover';

          // Detach any other elements and reattach to the existing video
          track.detach().forEach(el => {
            if (el !== videoEl) el.remove();
          });

          track.attach(videoEl);
          console.log('Remote video element attached:', videoEl);
        };

        attachRemoteRef.current = attachRemote;

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
      if (remoteContainer) {
        delete remoteContainer.dataset.override;
      }
    };
  }, [roomId, userId, localVideoRef, remoteVideoRef]);

  const restoreRemoteTracks = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    if (remoteVideoRef.current) {
      delete remoteVideoRef.current.dataset.override;
      const videoEl = remoteVideoRef.current.querySelector('video');
      if (videoEl) {
        videoEl.pause?.();
        videoEl.removeAttribute('src');
        videoEl.srcObject = null;
        videoEl.load();
      }
    }

    const attachFromParticipant = (participant) => {
      participant.tracks.forEach(pub => {
        if (pub.track) {
          attachRemoteRef.current(pub.track, true);
        }
      });
    };

    attachFromParticipant(room.localParticipant);
    room.participants.forEach(attachFromParticipant);
  }, [remoteVideoRef]);

  return {
    roomRef,
    restoreRemoteTracks,
  };
}
