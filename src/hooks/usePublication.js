import { useEffect, useState } from 'react';
import { LocalTrackPublication, Participant, RemoteTrackPublication } from 'twilio-video';

export default function usePublication(participant) {

  const [publications, setPublications] = useState([]);

  useEffect(() => {
    if(participant) {
      setPublications(Array.from(participant.tracks.values()));

      const publicationAdded = (publication) => setPublications(
        prevPublications => [...prevPublications, publication]
       );
        const publicationRemoved = (publication) => setPublications(
        prevPublications => prevPublications.filter(p => p != publication)
       );

       participant.on('trackPublished', publicationAdded);
       participant.on('trackUnpublished', publicationRemoved);
      return () => {
        participant.off('trackPublished', publicationAdded);
       participant.off('trackUnpublished', publicationRemoved);
      };
    }
  }, [participant]);

  return publications;
}