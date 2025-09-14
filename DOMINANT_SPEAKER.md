# Dominant Speaker Detection

This video call application now includes advanced dominant speaker detection functionality using Twilio's built-in dominant speaker API.

## Features

### 🎙️ Real-time Dominant Speaker Detection
- Automatically detects who is speaking most prominently in the call
- Updates in real-time as conversation flows between participants
- Shows visual indicators for the current dominant speaker

### 📊 Visual Indicators

#### Top Banner
- **Green banner**: Shows current dominant speaker's name
- **Gray banner**: Displayed when no active speaker is detected

#### Video Containers
- **Green ring**: Highlights video of current dominant speaker
- **Smooth transitions**: 300ms animation when speaker changes
- **Overlay labels**: Shows "You 🎙️" or "Remote 🎙️" for speaking participants

#### Participants List
- **Live participant count**: Shows total number of connected users
- **Speaking status**: Real-time indicator for each participant
  - 🎙️ Speaking (green, animated pulse)
  - 🔇 Quiet (gray, static)

### 🔧 Technical Implementation

#### Hook: `useTwilioRoom`
- Returns: `{ roomRef, dominantSpeaker, participants }`
- **dominantSpeaker**: Current dominant speaker participant object
- **participants**: Map of all connected participants with metadata

#### Configuration
- `dominantSpeaker: true` - Enables Twilio's dominant speaker detection
- `maxAudioBitrate: 16000` - Optimized for clear audio detection
- Automatic participant tracking and state management

#### Event Handling
- `dominantSpeakerChanged` - Fires when dominant speaker changes
- `participantConnected`/`participantDisconnected` - Updates participant list
- Console logging for debugging speaker changes

## Usage

### Basic Implementation
```javascript
const { roomRef, dominantSpeaker, participants } = useTwilioRoom(roomId, userId, localVideoRef, remoteVideoRef);

// Check if current user is dominant speaker
const isLocalDominant = dominantSpeaker && participants.get(dominantSpeaker.sid)?.isLocal;

// Get dominant speaker name
const dominantSpeakerName = dominantSpeaker ? dominantSpeaker.identity : null;
```

### Testing
1. **Open two browser tabs** with different user IDs
2. **Join the same room** in both tabs
3. **Speak in one tab** - should see dominant speaker indicator update
4. **Switch speaking between tabs** - visual indicators should follow
5. **Check browser console** for detailed logging

### Debugging
- Enable browser microphone permissions
- Check console logs for "🎙️ Dominant speaker updated:" messages
- Ensure Twilio credentials are configured in `.env.local`
- Test with actual audio input (speaking, not just background noise)

## Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Firefox 
- ✅ Safari
- ✅ Edge

**Note**: Dominant speaker detection requires audio input and works best in environments with clear speech and minimal background noise.
