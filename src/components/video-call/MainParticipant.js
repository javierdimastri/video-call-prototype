import ParticipantTracks from '../media-track/ParticipantTracks';
// import RemoteControllerButton from '@/components/button/video-call/RemoteControllerButton';
import { useVideoContext } from '@/hooks/VideoContext';
import useMainParticipant from '@/hooks/useMainParticipant';

export default function MainParticipant({ addAudioTrack }) {
  const { room } = useVideoContext();
  const mainParticipant = useMainParticipant();

  return (
    <>
      <ParticipantTracks participant={mainParticipant} isMainParticipant={true} addAudioTrack={addAudioTrack}/>
      {/* <RemoteControllerButton
        roomSid={room?.sid}
        participantSid={mainParticipant?.sid}
        participantIdentity={mainParticipant?.identity}
        isMainParticipant={true}
        handleRemoveParticipant={handleRemoveParticipant}
      /> */}
    </>
  );
}
