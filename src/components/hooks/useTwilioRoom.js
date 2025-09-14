import { useEffect, useRef, useState } from 'react';
import { connect } from 'twilio-video';

export function useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef) {
  const roomRef = useRef(null);
  const [dominantSpeaker, setDominantSpeaker] = useState(null);
  const [participants, setParticipants] = useState(new Map());

  useEffect(() => {
    let isMounted = true;

    const joinRoom = async () => {
      try {
        const res = await fetch(`/api/token/${roomId}?userId=${userId}`);
        const { token } = await res.json();

        const room = await connect(token, { 
          name: roomId,
          audio: true,
          video: { width: 480, height: 360 },
          dominantSpeaker: true,
          maxAudioBitrate: 16000,
          maxVideoBitrate: 2400000
        });
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
            console.log('Local video element attached:', el);
          }
        });

        // Attach local audio
        room.localParticipant.audioTracks.forEach(pub => {
          const track = pub.track;
          if (track) {
            console.log('Local audio track attached:', track.id);
          }
        });

        const attachRemote = (track) => {
          if (track.kind === 'video' && remoteVideoRef.current) {
            // Clear previous video elements
            const existingVideos = remoteVideoRef.current.querySelectorAll('video');
            existingVideos.forEach(video => video.remove());
            
            const el = track.attach();
            el.id = `remote-video-${track.sid}`;
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.objectFit = 'cover';
            remoteVideoRef.current.appendChild(el);
            console.log('Remote video element attached:', el);
          } else if (track.kind === 'audio') {
            // Audio tracks are automatically played when attached
            const el = track.attach();
            el.id = `remote-audio-${track.sid}`;
            document.body.appendChild(el); // Audio elements can be hidden
            console.log('Remote audio element attached:', el);
          }
        };

        const detachRemote = (track) => {
          if (track.kind === 'video') {
            const el = document.getElementById(`remote-video-${track.sid}`);
            if (el) el.remove();
            track.detach().forEach(e => e.remove());
          } else if (track.kind === 'audio') {
            const el = document.getElementById(`remote-audio-${track.sid}`);
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
          
          // Update participants map
          setParticipants(prev => {
            const updated = new Map(prev);
            updated.set(p.sid, {
              participant: p,
              isLocal: false,
              identity: p.identity
            });
            return updated;
          });
        });

        room.on('participantDisconnected', p => {
          console.log('Participant disconnected:', p.identity);
          p.tracks.forEach(pub => {
            if (pub.track) detachRemote(pub.track);
          });
          // Remove from participants map
          setParticipants(prev => {
            const updated = new Map(prev);
            updated.delete(p.sid);
            return updated;
          });
        });

        // Handle dominant speaker changes
        room.on('dominantSpeakerChanged', participant => {
          console.log('Dominant speaker changed:', participant ? participant.identity : 'none');
          setDominantSpeaker(participant);
        });

        // Track all participants
        const updateParticipants = () => {
          const participantMap = new Map();
          
          // Add local participant
          participantMap.set(room.localParticipant.sid, {
            participant: room.localParticipant,
            isLocal: true,
            identity: room.localParticipant.identity
          });
          
          // Add remote participants
          room.participants.forEach(p => {
            participantMap.set(p.sid, {
              participant: p,
              isLocal: false,
              identity: p.identity
            });
          });
          
          setParticipants(participantMap);
        };

        updateParticipants();

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
  }, [roomId, userId, localVideoRef, remoteVideoRef]);

  return { roomRef, dominantSpeaker, participants };
}
