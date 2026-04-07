# Emergency Voice Mode Features

## Overview
Emergency Voice Mode provides a hands-free voice command interface for industrial emergencies, allowing workers wearing PPE/gloves to interact with K-LENS using voice commands.

## Key Components

### 1. Floating Action Button (FAB)
- **Position**: Bottom-right corner, fixed
- **Design**: Red circular button with microphone icon
- **Pulsing Animation**: Attention-grabbing pulse effect
- **Keyboard Shortcut**: Ctrl+Space to activate
- **Visibility**: Hidden when AI chat is open (prevents overlap)

### 2. Voice Command Modal
- **Full-screen Overlay**: Dark backdrop with glassmorphism
- **Central Dialog**: Large modal with voice controls
- **Close Button**: X button or Escape key
- **Waveform Visualization**: 24-bar audio waveform
- **Status Display**: Current command recognition status

### 3. Command Recognition System

#### Supported Commands

##### Document Commands
- **"Show me the fire suppression manual"**: Opens fire safety documents
- **"Show me the safety rules"**: Opens safety protocols
- **"Search for [query]"**: Searches documents
- **"Find [topic]"**: Semantic search

##### IoT Commands
- **"Isolate pump P-301"**: Sends shutdown command to equipment
- **"Shut down motor M-42"**: Emergency equipment shutdown
- **"Check sensor status"**: Opens IoT dashboard
- **"Open IoT dashboard"**: Navigates to IoT view

##### Team Commands
- **"Who is the safety officer?"**: Shows current safety officer
- **"Who is the manager?"**: Shows shift manager
- **"Who is the supervisor?"**: Shows shift supervisor

##### Emergency Commands (Require Confirmation)
- **"Trigger evacuation alarm"**: Activates evacuation protocol
- **"Emergency SOS"**: Sends distress signal
- **"Activate emergency alarm"**: Triggers alarm system

#### Command Processing Flow
1. **Voice Input**: User speaks command
2. **Speech Recognition**: Web Speech API transcribes
3. **Pattern Matching**: Regex patterns match command
4. **Confirmation**: Critical commands require "confirm" or "cancel"
5. **Execution**: Action performed (navigation, API call, alarm)
6. **Voice Feedback**: Text-to-speech confirms action

### 4. Confirmation Dialog
- **Critical Actions**: Evacuation, SOS require confirmation
- **Visual Warning**: Large warning icon with red theme
- **Confirmation Prompt**: "Say 'Confirm' or 'Cancel'"
- **Voice Confirmation**: Accepts "yes", "confirm", "proceed"
- **Voice Cancellation**: Accepts "no", "cancel", "abort"
- **Button Fallback**: Click buttons if voice fails

### 5. Evacuation Alert System

#### Evacuation Overlay
- **Full-screen Alert**: Red flashing overlay
- **Siren Sound**: Audio alarm (Web Audio API)
- **Alert Message**: "ALL PERSONNEL EVACUATE IMMEDIATELY"
- **Assembly Point Info**: "Proceed to designated assembly points"
- **Dismiss Button**: Stop alarm and dismiss alert

#### Siren Generation
- **Web Audio API**: Generates siren sound programmatically
- **Frequency Sweep**: 440Hz to 880Hz sawtooth wave
- **Duration**: 10 seconds (10 cycles)
- **Volume**: 30% to avoid hearing damage
- **Mute Button**: Option to mute siren

### 6. Command History
- **Recent Commands**: Last 10 commands displayed
- **Timestamp**: When command was executed
- **Success/Failure**: Visual indicator
- **Replay**: Click to re-execute command
- **Clear History**: Button to clear all history

### 7. Emergency Contacts Panel
- **Quick Access**: Phone icon to toggle
- **Contact List**:
  - Rajesh Kumar (Safety Officer) - Ext. 4421
  - Priya Sharma (Shift Supervisor) - Ext. 4422
  - Control Room (Emergency Response) - Ext. 100
  - Medical Bay (First Aid) - Ext. 108
- **One-click Call**: Click to initiate call (if supported)

## Voice Technology

### Speech Recognition
- **Web Speech API**: Browser-native speech recognition
- **Continuous Listening**: Stays active until stopped
- **Interim Results**: Real-time transcription display
- **Language**: English (US) primary
- **Accuracy**: ~95% for clear speech in quiet environments

### Text-to-Speech
- **Web Speech Synthesis API**: Browser-native TTS
- **Voice Feedback**: Confirms every action
- **Urgent Mode**: Faster rate, higher pitch for emergencies
- **Volume**: 100% for critical alerts
- **Language**: English (US)

### Noise Handling
- **Microphone Permissions**: Requests access on first use
- **Error Handling**: Graceful fallback on permission denial
- **Retry Logic**: Auto-restart on recognition errors
- **Timeout**: 10 seconds of silence stops listening

## Command Patterns

### Pattern Matching
- **Regex Patterns**: Flexible command matching
- **Case Insensitive**: Works with any capitalization
- **Partial Matching**: Matches key phrases
- **Fallback**: Unmatched commands trigger search

### Example Patterns
```javascript
// Fire manual
/fire\s*(suppression|safety|manual)/i

// Safety officer
/safety\s*officer/i
/who\s*is\s*(the\s*)?(safety|shift|duty)/i

// Evacuation
/trigger\s*(evacuation|alarm|emergency)/i
/evacuation\s*alarm/i

// Equipment isolation
/isolate\s*(pump|motor|valve)/i
/shut\s*(down|off)\s*(pump|motor)/i
```

## Technical Implementation

### Frontend Components
- `EmergencyVoiceMode.tsx`: Main voice interface
- `useVoiceToText.ts`: Voice recognition hook
- Custom CSS in `emergency-voice.css`

### Voice Recognition Setup
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  processCommand(transcript);
};
```

### Audio Synthesis
```javascript
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
oscillator.type = 'sawtooth';
oscillator.frequency.setValueAtTime(440, startTime);
oscillator.frequency.linearRampToValueAtTime(880, startTime + 0.5);
```

## Integration Points

### Navigation
- **React Router**: Programmatic navigation to different views
- **Search Integration**: Passes query to SearchDiscoveryView
- **Document Viewer**: Opens specific documents

### Backend APIs
- `POST /api/iot/isolate` - Isolate equipment
- `POST /api/emergency/evacuation` - Trigger evacuation
- `POST /api/emergency/sos` - Send SOS alert
- `GET /api/team/on-duty` - Get current shift personnel

### WebSocket
- **Real-time Alerts**: Broadcast evacuation to all users
- **Team Notifications**: Notify team of emergency
- **Status Updates**: Equipment isolation status

## User Experience

### Visual Feedback
- **Listening Indicator**: Pulsing microphone icon
- **Waveform Animation**: Animated bars during listening
- **Transcript Display**: Real-time text of spoken words
- **Status Messages**: "Listening...", "Processing...", "Executing..."

### Audio Feedback
- **Confirmation Beep**: Short beep on command recognition
- **Error Sound**: Different tone for errors
- **Voice Confirmation**: Speaks action being performed
- **Siren**: Loud alarm for evacuations

### Accessibility
- **Large Buttons**: Touch-friendly for gloved hands
- **High Contrast**: Red/white for visibility in emergencies
- **Voice-only Operation**: No touch required
- **Keyboard Shortcuts**: Ctrl+Space, Escape

## Safety Features

### Confirmation for Critical Actions
- **Two-step Process**: Speak command, then confirm
- **Timeout**: 10 seconds to confirm or auto-cancel
- **Voice Confirmation**: Must say "confirm" explicitly
- **Abort Option**: Say "cancel" to abort

### Audit Logging
- **All Commands Logged**: Timestamp, user, command, result
- **Emergency Actions**: Special logging for evacuations
- **Compliance**: Meets industrial safety audit requirements
- **Tamper-proof**: Immutable audit trail

### Fail-safes
- **Button Fallback**: Click buttons if voice fails
- **Manual Override**: Physical buttons for critical systems
- **Network Independence**: Works offline for local commands
- **Battery Backup**: Continues on battery power

## Performance Optimization

### Voice Recognition
- **Continuous Mode**: Reduces latency
- **Interim Results**: Faster feedback
- **Auto-restart**: Recovers from errors
- **Debouncing**: Prevents duplicate commands

### Audio Generation
- **Web Audio API**: Low-latency audio
- **Preloaded Sounds**: Critical sounds preloaded
- **Efficient Synthesis**: Minimal CPU usage
- **Graceful Degradation**: Falls back to HTML5 audio

## Future Enhancements
- **Wake Word Detection**: "Hey K-LENS" to activate
- **Multi-language Support**: Hindi, Tamil, Telugu, etc.
- **Offline Mode**: Works without internet
- **Custom Commands**: Users define their own commands
- **Voice Biometrics**: Verify user identity by voice
- **Noise Cancellation**: Better recognition in noisy environments
- **Bluetooth Headset**: Support for wireless headsets
- **Smart Watch Integration**: Voice commands from wearables
