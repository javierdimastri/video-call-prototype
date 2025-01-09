import { useEffect, useState } from 'react';
// import {  } from 'twilio-video';
import { useVideoContext } from './VideoContext';

export default function useParticipants() {

  const { room } = useVideoContext();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (room) {
      setParticipants(Array.from(room?.participants.values()));
      const participantConnected = (participant) => setParticipants(prevParticipants => [...prevParticipants, participant]);

      const participantDisconnected = (participant) => setParticipants(prevParticipants => prevParticipants.filter(p => p != participant));

      room.on('particpantConnected', participantConnected);
      room.on('particpantDisconnected', participantDisconnected);
      return () => {
        room.off('particpantConnected', participantConnected);
        room.off('particpantDisconnected', participantDisconnected);
      };
    }
  }, [room]);

  return participants;

};