import { createContext, useContext, useState } from 'react';
// import { SelectedParticipantProvider } from '@/hooks/useSelectedParticipant';

const VideoContext = createContext(null);

export function VideoProvider({
  children,
  room,
  isForceStopRecording,
  handleNetworkError,
  urlUploadFile,
  handleCopyLocation
}) {
  const [mainParticipantVideoRef, setMainParticipantVideoRef] = useState(null);
  const [isUploading, setIsUploading] = useState(false);


      // value={{
      //   room,
      //   mainParticipantVideoRef,
      //   setMainParticipantVideoRef,
      //   isForceStopRecording,
      //   isUploading,
      //   setIsUploading,
      //   handleNetworkError,
      //   urlUploadFile,
      //   handleCopyLocation
      // }}

  return (
    <VideoContext.Provider
      value={{
        room,
        setMainParticipantVideoRef,
        mainParticipantVideoRef,
      }}
    >
        {children}
    </VideoContext.Provider>
  );
}

export const useVideoContext = () => useContext(VideoContext);
