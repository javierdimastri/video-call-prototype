import { useEffect, useRef, useState } from 'react';
import { connect } from 'twilio-video';

export function useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef) {
  const roomRef = useRef(null);
  const [dominantSpeaker, setDominantSpeaker] = useState(null);
  const [participants, setParticipants] = useState(new Map());
  const [remoteTracks, setRemoteTracks] = useState([]); // 👈 tambahan

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
          }
        });

        // Local audio
        room.localParticipant.audioTracks.forEach(pub => {
          if (pub.track) {
            console.log('Local audio track attached:', pub.track.id);
          }
        });

        const attachRemote = (track) => {
          console.log("📡 Remote track subscribed:", track.kind, track.sid);

          setRemoteTracks(prev => {
            // jangan double insert kalau sudah ada
            if (prev.find(t => t.sid === track.sid)) return prev;
            return [...prev, track];
          });

          if (track.kind === 'video' && remoteVideoRef.current) {
            const existingVideos = remoteVideoRef.current.querySelectorAll('video');
            existingVideos.forEach(video => video.remove());
            const el = track.attach();
            el.id = `remote-video-${track.sid}`;
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.objectFit = 'cover';
            remoteVideoRef.current.appendChild(el);
          } else if (track.kind === 'audio') {
            // tetap attach biar bisa kedengaran
            const el = track.attach();
            el.id = `remote-audio-${track.sid}`;
            el.style.display = "none"; // biar tidak kelihatan
            document.body.appendChild(el);

            // Ambil MediaStream langsung dari track
            const mediaStream = new MediaStream([track.mediaStreamTrack]);
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(mediaStream);
            const analyser = audioCtx.createAnalyser();

            source.connect(analyser);
            analyser.fftSize = 256;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let lastLog = Date.now();

            const updateLevel = () => {
              analyser.getByteFrequencyData(dataArray);
              const avg =
                dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

              if (Date.now() - lastLog > 500) {
                console.log("🎚️ Remote audio level:", avg);
                lastLog = Date.now();
              }

              requestAnimationFrame(updateLevel);
            };

            updateLevel();
          }
        };


        const detachRemote = (track) => {
          console.log("❌ Remote track unsubscribed:", track.kind, track.sid);

          setRemoteTracks(prev => prev.filter(t => t.sid !== track.sid));

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
          p.on('trackSubscribed', attachRemote);
          p.on('trackUnsubscribed', detachRemote);
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
          p.tracks.forEach(pub => {
            if (pub.track) detachRemote(pub.track);
          });
          setParticipants(prev => {
            const updated = new Map(prev);
            updated.delete(p.sid);
            return updated;
          });
        });

        // Dominant speaker
        room.on('dominantSpeakerChanged', participant => {
          setDominantSpeaker(participant);
        });

        // Track all participants
        const updateParticipants = () => {
          const participantMap = new Map();
          participantMap.set(room.localParticipant.sid, {
            participant: room.localParticipant,
            isLocal: true,
            identity: room.localParticipant.identity
          });
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

  return { roomRef, dominantSpeaker, participants, remoteTracks };
}