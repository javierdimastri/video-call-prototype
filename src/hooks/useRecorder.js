import { useCallback, useState } from 'react';
import { RecordRTCPromisesHandler } from 'recordrtc';

export default function useRecorder() {
  const [recorder, setRecorder] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

  const initMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      console.log('Media stream initialized');
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  }, []);

  const handleStartRecorder = useCallback(async () => {
    if (!mediaStream) {
      console.error('Media stream is not initialized');
      return;
    }

    if (recorder) {
      console.warn('Recorder already initialized');
      return;
    }

    const initiateRecorder = new RecordRTCPromisesHandler(mediaStream, {
      type: 'video',
      mimeType: 'video/webm',
    });

    setRecorder(initiateRecorder);
    await initiateRecorder.startRecording();
    console.log('Recording started');
  }, [mediaStream, recorder]);

  const handleStopRecording = useCallback(async () => {
    if (!recorder) {
      console.error('Recorder is not initialized');
      return;
    }

    await recorder.stopRecording();
    const blob = await recorder.getBlob();
    console.log('Recording stopped. Blob:', blob);
    return blob;
  }, [recorder]);

  return {
    initMediaStream,
    startRecording: handleStartRecorder,
    stopRecording: handleStopRecording,
    mediaStream,
  };
}


// import { isUndefined } from 'lodash';
// import { useCallback, useEffect, useState } from 'react';
// import { RecordRTCPromisesHandler } from 'recordrtc';

// export default function useRecorder (screen, audioTracks) {
//   const [recorder, setRecorder] = useState();
//   const [audioContext] = useState(new AudioContext());
//   const [audio] = useState(new MediaStreamAudioDestinationNode(audioContext));

//   // useEffect(() => {
//   //   audioTracks?.foreEach((audioTrack) => {
//   //     const audioMediaSrream = new MediaStream();
//   //     audioMediaSrream.addTrack(audioTrack);
//   //     const audioSource = audioContext.createMediaStreamSource(audioMediaSrream);
//   //     audioSource.connect(audio);
//   //   });
//   // }, [audioTracks, audio, audioContext]);

//   const handleStartRecorder = useCallback(() => {
//     let mixer;
//     let initiateRecorder;

//     if (isUndefined(recorder)) {
//       if (!isUndefined(screen)) {
//         mixer = new MediaStream([...screen.getTracks(), ...audio.stream.getTracks()]);
//         initiateRecorder = new RecordRTCPromisesHandler(mixer, {
//           type: 'video',
//           mimeType: 'video/webm',
//           disableLogs: false
//         });
//       } else {
//         mixer = new MediaStream([[...screen.getTracks(), ...audio.stream.getTracks()]]);
//         initiateRecorder = new RecordRTCPromisesHandler(mixer, {
//           type: 'audio',
//           mimeType: 'audio/ogg',
//           disableLogs: false
//         });
//       }

//       setRecorder(initiateRecorder);
//       initiateRecorder.startRecording()
//     }
//   }, [audio.stream, recorder, screen]);


//   const handleStopRecording = useCallback(async () => {
//     await recorder.stopRecording();
//     screen.getTracks().forEach(track => track.stop());
//     return recorder.getBlob();
//   }, [recorder, screen]);

//   const customRecorder = {
//     startRecording: handleStartRecorder,
//     stopRecording: handleStopRecording
//   }

//   return customRecorder;
// }