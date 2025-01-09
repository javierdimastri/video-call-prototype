import { useCallback, useState } from 'react';
import { RecordRTCPromisesHandler } from 'recordrtc';

export default function useRecorder() {
  const [recorder, setRecorder] = useState(null);

  const startRecording = useCallback(async (stream) => {
    const recorder = new RecordRTCPromisesHandler(stream, {
      type: 'video',
      mimeType: 'video/webm',
    });

    setRecorder(recorder);
    await recorder.startRecording();
    console.log('Recording started');
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recorder) {
      console.error('Recorder is not initialized');
      return;
    }

    await recorder.stopRecording();
    const blob = await recorder.getBlob();
    console.log('Recording stopped. Blob:', blob);

    // Cleanup
    setRecorder(null);

    return blob;
  }, [recorder]);

  return {
    startRecording,
    stopRecording,
  };
}
