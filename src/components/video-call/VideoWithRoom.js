import { VideoProvider } from '@/hooks/VideoContext';
import { useEffect, useState } from 'react';
import { connect } from 'twilio-video';
import RoomVideoCall from './RoomVideoCall';
import RoomVideoCallMod from './RoomVideoCallMod';

const VideoWithRoom = ({ roomId, userId, }) => {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    let roomConnected;

    const joinRoom = async () => {
      try {
        const response = await fetch(`/api/token/${roomId}?userId=${userId}`);
        const { token } = await response.json();

        // Hubungkan ke ruang video
        roomConnected = await connect(token, { name: roomId });
        console.log({ roomConnected });
        setRoom(roomConnected);

        // Cleanup saat komponen di-unmount
        return () => {};
      } catch (error) {
        console.error('Failed to connect to the room:', error);
      }
    };

    joinRoom();

    return () => {
      if (roomConnected) {
        roomConnected.disconnect();
      }
    };
  }, [roomId, userId]);

  return (
    room ? (
      <div className="flex">
        <VideoProvider room={room}>
          {/* <RoomVideoCall addAudioTrack={() => {}}/> */}
          <RoomVideoCallMod addAudioTrack={() => {}}/>
        </VideoProvider>
      </div>
    ) : (
      <div className="text-center text-gray-500">External Connecting...</div>
    )
  );
};

export default VideoWithRoom;
