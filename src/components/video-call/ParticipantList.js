import useMainParticipant from '@/hooks/useMainParticipant';
import useParticipants from '@/hooks/useParticipants';
import { useVideoContext } from '@/hooks/VideoContext';
import { UserIcon } from '@heroicons/react/24/solid';
import { isEmpty } from 'lodash';
import MainParticipant from './MainParticipant';
import Participant from './Participant';

export default function ParticipantList({ addAudioTrack }) {
  const participants = useParticipants();
  const { room } = useVideoContext();
  const mainParticipant = useMainParticipant();
  console.log({mainParticipant});
  

  return (
    <>
      {!isEmpty(mainParticipant) && !isEmpty(room) ? (
        <MainParticipant addAudioTrack={addAudioTrack} />
      ) : (
        <div className="flex justify-center items-center mt-10">
          <UserIcon className="text-gray-400 w-24 h-24" />
        </div>
      )}
      <div className="bottom-0 right-0 flex mt-3 ml-[50%]">
        {room?.localParticipant && (
          <Participant participant={room.localParticipant} isLocalParticipant={true} addAudioTrack={addAudioTrack} />
        )}
      </div>
    </>
  );
}
