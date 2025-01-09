import ParticipantTracks from '../media-track/ParticipantTracks';
import { useVideoContext } from '@/hooks/VideoContext';

export default function Participant({ participant, isLocalParticipant, addAudioTrack, handleRemoveParticipant }) {
  const { room } = useVideoContext();
  const appliedStyle = isLocalParticipant ? "relative mr-4" : "relative";

  return (
    <div className={appliedStyle} data-testid="participant">
      <ParticipantTracks participant={participant} addAudioTrack={addAudioTrack} />
    </div>
  );
}
