import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Snackbar from '../ui/Snackbar';
import { useTwilioRoom } from '../hooks/useTwilioRoom';

const Video = ({ roomId, userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '', key: 0 });

  const { roomRef, restoreRemoteTracks } = useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef);

  const replaceRemoteWithFallback = useCallback(() => {
    const container = remoteVideoRef.current;
    if (!container) return;

    container.dataset.override = 'true';

    let fallbackVideo = container.querySelector('video');
    if (!fallbackVideo) {
      fallbackVideo = document.createElement('video');
      container.appendChild(fallbackVideo);
    }

    Array.from(container.childNodes).forEach(node => {
      if (node !== fallbackVideo) node.remove();
    });

    const wasInPiP = document.pictureInPictureElement === fallbackVideo;

    fallbackVideo.pause?.();
    fallbackVideo.removeAttribute('src');
    fallbackVideo.srcObject = null;
    fallbackVideo.src = '/vid.mp4';
    fallbackVideo.autoplay = true;
    fallbackVideo.loop = true;
    fallbackVideo.preload = 'auto';
    fallbackVideo.setAttribute('playsinline', '');
    fallbackVideo.setAttribute('muted', '');
    fallbackVideo.setAttribute('autoplay', '');
    fallbackVideo.setAttribute('loop', '');
    fallbackVideo.defaultMuted = true;
    fallbackVideo.muted = true;
    fallbackVideo.controls = false;
    fallbackVideo.style.width = '100%';
    fallbackVideo.style.height = '100%';
    fallbackVideo.style.objectFit = 'cover';

    fallbackVideo.load();

    function cleanupInteractionListeners() {
      document.removeEventListener('pointerdown', onUserInteract);
      document.removeEventListener('keydown', onUserInteract);
      fallbackVideo.removeEventListener('touchstart', onUserInteract);
      fallbackVideo.removeEventListener('click', onUserInteract);
    }

    function attemptPlay() {
      const playPromise = fallbackVideo.play?.();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(err => {
          console.warn('Fallback video autoplay prevented', err);
          fallbackVideo.controls = true;
          document.addEventListener('pointerdown', onUserInteract, { once: true });
          document.addEventListener('keydown', onUserInteract, { once: true });
          fallbackVideo.addEventListener('touchstart', onUserInteract, { once: true });
          fallbackVideo.addEventListener('click', onUserInteract, { once: true });
        });
      }
    }

    function onUserInteract() {
      fallbackVideo.controls = false;
      attemptPlay();
      cleanupInteractionListeners();
    }

    fallbackVideo.addEventListener(
      'play',
      () => {
        fallbackVideo.controls = false;
        cleanupInteractionListeners();
      },
      { once: true }
    );

    const haveEnoughData =
      typeof HTMLMediaElement !== 'undefined'
        ? HTMLMediaElement.HAVE_ENOUGH_DATA
        : 4; // fallback value for environments without the constant

    if (fallbackVideo.readyState >= haveEnoughData) {
      attemptPlay();
    } else {
      fallbackVideo.addEventListener('canplay', attemptPlay, { once: true });
    }

    const room = roomRef.current;
    if (room) {
      room.participants.forEach(participant => {
        participant.tracks.forEach(publication => {
          const track = publication.track;
          if (track?.kind === 'video') {
            track.detach().forEach(el => {
              if (el !== fallbackVideo) {
                el.remove();
              }
            });
          }
        });
      });
    }

    if (wasInPiP) {
      fallbackVideo.requestPictureInPicture?.().catch(err => {
        console.warn('Failed to update PiP for fallback video', err);
      });
    }
  }, [remoteVideoRef, roomRef]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.warn('Socket URL is not defined. Set NEXT_PUBLIC_SOCKET_URL to enable notifications.');
      return;
    }

    const eventName = process.env.NEXT_PUBLIC_VIDEO_EVENT ?? 'video-event';
    console.log(`Connecting to socket server at ${socketUrl} for room:${roomId} user:${userId}, event:${eventName}`);

    const socket = io(socketUrl, {
      query: {
        roomId,
        userId,
      },
    });

    const handleEvent = (payload) => {
      console.log('Received socket event:', payload);
      const normalized = typeof payload === 'string' ? { message: payload } : payload ?? {};
      const message = normalized.message ?? 'New room update received.';
      const directive = (normalized.action ?? message)?.toLowerCase?.();

      setSnackbarState(prev => ({ open: true, message, key: prev.key + 1 }));

      if (directive === 'pause') {
        replaceRemoteWithFallback();
      } else if (directive === 'resume') {
        restoreRemoteTracks();
      }
    };

    socket.on(eventName, handleEvent);

    return () => {
      socket.off(eventName, handleEvent);
      socket.disconnect();
    };
  }, [roomId, userId, replaceRemoteWithFallback, restoreRemoteTracks]);

  const handlePiP = async () => {
    if (!document.pictureInPictureEnabled) {
      alert("Picture-in-Picture is not supported on this browser.");
      return;
    }

    const videoEl = remoteVideoRef.current?.querySelector('video');
    if (videoEl) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoEl.requestPictureInPicture();
        }
      } catch (err) {
        console.error("Failed to toggle PiP", err);
      }
    } else {
      console.log("No remote video element available for PiP");
    }
  };
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
        onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default Video;
