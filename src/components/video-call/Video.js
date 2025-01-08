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

        // Hubungkan ke ruang video
        room = await connect(token, { name: roomId });
        console.log({room});

        if (room) {
                  // Tambahkan track video lokal
        room.localParticipant.videoTracks.forEach(publication => {
          const track = publication.track;
          if (track && localVideoRef.current) {
            while (localVideoRef.current.firstChild) {
              localVideoRef.current.removeChild(localVideoRef.current.firstChild);
            }
            const videoElement = track.attach();
            videoElement.id = `local-${track.sid}`;
            localVideoRef.current.appendChild(videoElement);
            console.log('Local track attached:', track);
          }
        });

        if (room.participants.size > 0) {
          room.participants.forEach(participant => {
            console.log(`Participant connected: ${participant.identity}`);

            // Lakukan iterasi pada semua video tracks yang dimiliki participant
            participant.videoTracks.forEach(publication => {
              if (publication.isSubscribed) {
                const track = publication.track;

                if (track && remoteVideoRef.current) {
                  // Hapus elemen video sebelumnya dari DOM
                  while (remoteVideoRef.current.firstChild) {
                    remoteVideoRef.current.removeChild(remoteVideoRef.current.firstChild);
                  }

                  // Attach video track
                  const videoElement = track.attach();
                  videoElement.id = `remote-${track.sid || track.id || track.name}`;
                  remoteVideoRef.current.appendChild(videoElement);
                  console.log('Remote video track attached:', track);
                }
              }
            });

            // Listen for future video track subscriptions
            participant.on('trackSubscribed', track => {
              if (track.kind === 'video' && remoteVideoRef.current) {
                console.log('New remote video track subscribed:', track);

                const videoElement = track.attach();
                videoElement.id = `remote-${track.sid || track.id || track.name}`;
                remoteVideoRef.current.appendChild(videoElement);
              }
            });

            // Handle track unsubscription
            participant.on('trackUnsubscribed', track => {
              console.log('Remote video track unsubscribed:', track);
              const element = document.getElementById(`remote-${track.sid || track.id || track.name}`);
              if (element) {
                element.remove();
              }
            });
          });
        }

        // Event: Peserta baru bergabung
        room.on('participantConnected', participant => {
          console.log(`Participant connected: ${participant.identity}`);
          console.log(`Participant: ${participant}`);

          // Tangani track yang sudah tersedia saat peserta bergabung
          participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
              const track = publication.track;
              if (track.kind === 'video' && remoteVideoRef.current) {
                const videoElement = track.attach();
                videoElement.id = `remote-${track.sid}`;
                remoteVideoRef.current.appendChild(videoElement);
              }
            }

            // Event: Tangani track yang diterbitkan setelah peserta bergabung
            publication.on('subscribed', track => {
              console.log('Track subscribed:', track.kind, track.sid);
              if (track.kind === 'video' && remoteVideoRef.current) {
                const videoElement = track.attach();
                videoElement.id = `remote-${track.sid}`;
                remoteVideoRef.current.appendChild(videoElement);
              }
            });
          });

          // Event: Track baru dipublikasikan oleh peserta
          participant.on('trackPublished', publication => {
            console.log('Track published:', publication.kind);
            publication.on('subscribed', track => {
              console.log('Track subscribed:', track.kind, track.sid);
              if (track.kind === 'video' && remoteVideoRef.current) {
                const videoElement = track.attach();
                videoElement.id = `remote-${track.sid}`;
                remoteVideoRef.current.appendChild(videoElement);
              }
            });
          });
        });

        // Event: Peserta meninggalkan ruangan
        room.on('participantDisconnected', participant => {
          console.log(`Participant disconnected: ${participant.identity}`);
          participant.tracks.forEach(publication => {
            if (publication.track) {
              const elements = publication.track.detach();
              elements.forEach(element => element.remove());
            }
          });
        });
        }    

        // Cleanup saat komponen di-unmount
        return () => {
          if (room) {
            room.disconnect();
            room.localParticipant.tracks.forEach(publication => {
              if (publication.track) {
                publication.track.stop();
                const attachedElements = publication.track.detach();
                attachedElements.forEach(element => element.remove());
              }
            });
          }
        };
      } catch (error) {
        console.error('Failed to connect to the room:', error);
      }
    };

    joinRoom();

    return () => {
      if (room) {
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
