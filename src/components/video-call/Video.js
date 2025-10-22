import Snackbar from '../ui/Snackbar';
import { useVideoCall } from '../hooks/useVideoCall';

const Video = ({ roomId, userId }) => {
  const { localVideoRef, remoteVideoRef, snackbarState, dismissSnackbar, handlePiP } = useVideoCall(roomId, userId);

  return (
    <div className="flex flex-col items-center space-y-4 p-2 w-full h-full">
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 w-full max-w-screen-md">
        <div
          ref={localVideoRef}
          className="bg-black sm:w-1/3 aspect-video rounded overflow-hidden"
        />
        <div
          ref={remoteVideoRef}
          className="bg-black w-full sm:w-2/3 aspect-video rounded overflow-hidden"
        />
      </div>

      <button
        onClick={handlePiP}
        className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition disabled:opacity-50"
      >
        Toggle PiP Mode
      </button>

      <Snackbar
        key={snackbarState.key}
        open={snackbarState.open}
        message={snackbarState.message}
        onClose={dismissSnackbar}
      />
    </div>
  );
};

export default Video;

