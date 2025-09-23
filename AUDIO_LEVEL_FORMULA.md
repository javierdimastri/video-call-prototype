# Audio Level Formula & Green Frame Implementation

This document explains how audio levels are calculated in the video call application and how the green frame feature works when audio levels exceed the threshold of 10.

## 🎵 Audio Level Calculation Formula

The audio level values are calculated using the **Web Audio API** with the following process:

### 1. **Audio Context Setup**
```javascript
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(mediaStream);
const analyser = audioContext.createAnalyser();
```

### 2. **Frequency Analysis Configuration**
```javascript
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount; // = 128 (half of fftSize)
const dataArray = new Uint8Array(bufferLength);
```

### 3. **Audio Level Calculation Formula**
```javascript
// Get frequency data from the audio analyser
analyser.getByteFrequencyData(dataArray);

// Calculate average amplitude across all frequency bins
const audioLevel = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
```

### **Mathematical Explanation:**

The formula calculates the **Root Mean Square (RMS) equivalent** of audio amplitude:

```
Audio Level = (Σ(frequency_bin_values)) / number_of_bins

Where:
- frequency_bin_values: Array of 128 values (0-255 each)
- number_of_bins: 128 (analyser.frequencyBinCount)
- Result range: 0-255
```

## 🎯 Audio Level Value Ranges

| Range | Description | Visual Indicator |
|-------|-------------|------------------|
| **0-10** | Silent/Very quiet | No green frame |
| **11-50** | Low volume speech | **Green frame ON** 🟢 |
| **51-100** | Normal conversation | **Green frame ON** 🟢 |
| **101-150** | Loud speech | **Green frame ON** 🟢 |
| **150+** | Very loud/shouting | **Green frame ON** 🟢 |

## 🖼️ Green Frame Implementation

### **Trigger Condition**
The green frame appears when: `audioLevel > 10`

### **Visual Effects Applied**
```css
/* Green ring around video container */
.ring-4.ring-green-500.shadow-green-500/50

/* Audio indicator icon */
🔊 (speaker icon in video overlay)
```

### **Implementation Logic**
```javascript
// Local participant
const isLocalAudioHigh = localAudioLevel > 10;

// Remote participants  
const isRemoteAudioHigh = Array.from(audioLevels.values()).some(level => level > 10);

// Apply visual styling
className={`${isLocalAudioHigh ? 'ring-4 ring-green-500 shadow-green-500/50' : ''}`}
```

## 🔧 Technical Details

### **Frequency Analysis Parameters**
- **FFT Size**: 256 samples
- **Frequency Bins**: 128 bins
- **Sample Rate**: Determined by audio track (typically 48kHz)
- **Update Rate**: ~60fps (requestAnimationFrame)

### **Audio Processing Pipeline**
1. **MediaStream** → Audio track from microphone
2. **MediaStreamSource** → Web Audio API source node
3. **AnalyserNode** → Frequency domain analysis
4. **getByteFrequencyData()** → Extract amplitude data
5. **Average Calculation** → Single audio level value
6. **State Update** → React state management
7. **Visual Rendering** → Green frame display

## 📊 Frequency Domain Analysis

The `getByteFrequencyData()` method provides:
- **128 frequency bins** representing different frequency ranges
- Each bin contains amplitude value **0-255**
- **Lower frequencies** (0-20): Bass and low tones
- **Mid frequencies** (21-80): Human voice range
- **Higher frequencies** (81-127): High-pitched sounds

### **Human Voice Characteristics**
- **Fundamental frequency**: ~85Hz-255Hz (bins 5-15)
- **Formants**: 300Hz-3400Hz (bins 15-60)
- **Consonants**: Up to 8000Hz (bins 60-127)

## 🎚️ Sensitivity & Calibration

### **Why Threshold = 10?**
- **0-5**: Background noise, mic sensitivity
- **6-10**: Very quiet speech, mouth sounds
- **11+**: Audible speech that should trigger visual feedback

### **Fine-tuning Options**
```javascript
// Conservative (less sensitive)
const audioThreshold = 15;

// Moderate (current setting)
const audioThreshold = 10;

// Sensitive (more responsive)
const audioThreshold = 5;
```

## 🚀 Performance Optimization

### **Real-time Processing**
- **RequestAnimationFrame**: Synced with display refresh rate
- **Efficient Calculation**: Single reduce operation
- **State Management**: Minimal React re-renders
- **Memory Management**: Cleanup on component unmount

### **Browser Compatibility**
- ✅ **Chrome**: Full support
- ✅ **Firefox**: Full support  
- ✅ **Safari**: Full support
- ✅ **Edge**: Full support

## 🐛 Debugging & Monitoring

### **Console Output**
```javascript
// Local audio monitoring
console.log('🎚️ Local audio level:', localAudioLevel, '(Green frame:', isLocalAudioHigh ? 'ON' : 'OFF');

// Remote audio monitoring  
console.log('🎚️ Remote audio level:', avg, '(Green frame:', avg > 10 ? 'ON' : 'OFF');
```

### **Testing Tips**
1. **Speak normally** → Should see levels 20-60
2. **Whisper** → Should see levels 5-15  
3. **Shout** → Should see levels 80-150+
4. **Background silence** → Should see levels 0-8
5. **Green frame** → Should appear at level 11+

---

## 📝 Summary

The audio level formula uses **Web Audio API frequency analysis** to calculate real-time amplitude averages across 128 frequency bins. When this average exceeds **10**, a green frame with glow effect appears around the video container, providing immediate visual feedback for active speakers in the video call.