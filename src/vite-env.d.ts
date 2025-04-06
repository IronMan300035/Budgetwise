
/// <reference types="vite/client" />

// Add Web Speech API declarations
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
