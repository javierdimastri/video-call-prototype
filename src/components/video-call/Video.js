import { useEffect, useRef } from 'react';
import { connect } from 'twilio-video';

const Video = ({ roomId, userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    let room;

    const joinRoom = async () => {
      try {
        // Ambil token dari backend
        const response = await fetch(`/api/token/${roomId}?userId=${userId}`);
        const { token } = await response.json();

        // Hubungkan ke ruang video
        room = await connect(token, { name: roomId });

        // Tambahkan track video lokal
        room.localParticipant.videoTracks.forEach(publication => {
          const track = publication.track;

          if (track && localVideoRef.current) {
            // Bersihkan elemen video sebelumnya
            while (localVideoRef.current.firstChild) {
              localVideoRef.current.removeChild(localVideoRef.current.firstChild);
            }

            // Attach track ke elemen video
            const videoElement = track.attach();
            videoElement.id = `local-${track.sid}`;
            localVideoRef.current.appendChild(videoElement);
            console.log('Local track attached:', track.sid);
          }
        });

        // Tambahkan track video remote
        // room.on('participantConnected', participant => {
        //   participant.on('trackSubscribed', track => {
        //     if (remoteVideoRef.current) {
        //       const videoElement = track.attach();
        //       videoElement.id = `remote-${track.sid}`;
        //       remoteVideoRef.current.appendChild(videoElement);
        //       console.log('Remote track attached:', track.sid);
        //     }
        //   });
        // });
        room.on('participantConnected', participant => {
          console.log(`Participant connected: ${participant.identity}`);
          console.log(`localParticipant Participant connected: ${room.localParticipant.identity}`);

          participant.on('trackSubscribed', track => {
            if (remoteVideoRef.current && participant !== room.localParticipant) {
              console.log('Attaching remote track:', track);
              const videoElement = track.attach();
              videoElement.id = `remote-${track.sid}`;
              remoteVideoRef.current.appendChild(videoElement);
            }
          });
        });

        // Cleanup saat komponen di-unmount
        return () => {
          room.disconnect();
          room.localParticipant.tracks.forEach(publication => {
            if (publication.track) {
              publication.track.stop();
              const attachedElements = publication.track.detach();
              attachedElements.forEach(element => element.remove());
            }
          });
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
  }, [roomId]);

  return (
    <div className="flex flex-row space-x-4">
      <div ref={localVideoRef} className="local-video" />
      <div ref={remoteVideoRef} className="remote-video" />
    </div>
  );
};

export default Video;
