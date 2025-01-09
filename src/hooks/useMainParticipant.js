import useParticipants from '@/hooks/useParticipants';
import {isEmpty} from 'lodash';

export default function useMainParticipant() {
  const participants = useParticipants();

  // const mainParticipant = !isEmpty(participants) ? participants.find(participant => participant.identity.includes('Sky')) : undefined;

  return !isEmpty(participants) ? participants.find(participant => participant.identity.includes('Sky')) : undefined;
}