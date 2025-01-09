import useTrack from '../../hooks/useTrack';
import Tracks from './Tracks';

// Mendefinisikan Track sebagai LocalTrackPublication atau RemoteTrackPublication
const Publication = ({ publications, isMainParticipant, addAudioTrack }) => {
  const videoPublication = publications.find(publication => publication?.kind === 'video');
  const audioPublication = publications.find(publication => publication?.kind === 'audio');
  const videoTrack = useTrack(videoPublication);
  const audioTrack = useTrack(audioPublication);

  if (!videoTrack || !audioTrack) return null;

  return (
    <Tracks
      videoTrack={videoTrack}
      audioTrack={audioTrack}
      isMainParticipant={isMainParticipant}
      addAudioTrack={addAudioTrack}
    />
  );
}

export default Publication;
