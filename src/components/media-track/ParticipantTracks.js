import usePublication from "@/hooks/usePublication";
import Publication from "./Publication";


export default function ParticipantTracks({
participant, isMainParticipant, addAudioTrack
}) {
  const publications = usePublication(participant);

  return (
    <Publication publications={publications} addAudioTrack={addAudioTrack} isMainParticipant={isMainParticipant} />
  )
}