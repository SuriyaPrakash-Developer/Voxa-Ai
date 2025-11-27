import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
// FIX: Update import to allow ConnectionState to be used as a value.
import { type LiveSession, type TranscriptEntry, ConnectionState } from '../types';

// Audio Encoding & Decoding functions
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Live Conversation Service ---

let inputAudioContext: AudioContext;
let outputAudioContext: AudioContext;
let microphoneStream: MediaStream;
let scriptProcessor: ScriptProcessorNode;
let nextStartTime = 0;
const audioSources = new Set<AudioBufferSourceNode>();

interface ConversationCallbacks {
  onConnectionStateChange: (state: ConnectionState) => void;
  onTranscriptUpdate: (entry: TranscriptEntry, isFinal: boolean) => void;
  onError: (error: Error) => void;
}

export async function startConversation(callbacks: ConversationCallbacks): Promise<LiveSession> {
  // FIX: Use ConnectionState enum member instead of string literal.
  callbacks.onConnectionStateChange(ConnectionState.CONNECTING);

  let apiKey = import.meta.env.VITE_API_KEY as string | undefined;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    try {
      const response = await fetch('http://localhost:3001/api/config');
      if (response.ok) {
        const data = await response.json();
        apiKey = data.apiKey;
      }
    } catch (error) {
      console.error("Failed to fetch API key from server:", error);
    }
  }

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error("VITE_API_KEY environment variable not set and failed to fetch from server.");
  }
  const ai = new GoogleGenAI({ apiKey });

  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

  let currentInputTranscription = '';
  let currentOutputTranscription = '';

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: async () => {
        // FIX: Use ConnectionState enum member instead of string literal.
        callbacks.onConnectionStateChange(ConnectionState.CONNECTED);
        microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = inputAudioContext.createMediaStreamSource(microphoneStream);
        scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
          callbacks.onTranscriptUpdate({ speaker: 'Gemini', text: message.serverContent.outputTranscription.text }, false);
          currentOutputTranscription += message.serverContent.outputTranscription.text;
        } else if (message.serverContent?.inputTranscription) {
          callbacks.onTranscriptUpdate({ speaker: 'User', text: message.serverContent.inputTranscription.text }, false);
          currentInputTranscription += message.serverContent.inputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
          if (currentInputTranscription.trim()) {
            callbacks.onTranscriptUpdate({ speaker: 'User', text: currentInputTranscription }, true);
          }
          if (currentOutputTranscription.trim()) {
            callbacks.onTranscriptUpdate({ speaker: 'Gemini', text: currentOutputTranscription }, true);
          }
          currentInputTranscription = '';
          currentOutputTranscription = '';
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
          nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
          const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputAudioContext.destination);
          source.addEventListener('ended', () => audioSources.delete(source));
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
          audioSources.add(source);
        }

        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
          for (const source of audioSources.values()) {
            source.stop();
            audioSources.delete(source);
          }
          nextStartTime = 0;
        }
      },
      onerror: (e: ErrorEvent) => {
        console.error('Gemini Live API Error:', e);
        // FIX: Use ConnectionState enum member instead of string literal.
        callbacks.onConnectionStateChange(ConnectionState.ERROR);
        callbacks.onError(new Error(e.message));
        stopConversation();
      },
      onclose: () => {
        // FIX: Use ConnectionState enum member instead of string literal.
        callbacks.onConnectionStateChange(ConnectionState.DISCONNECTED);
        stopConversation();
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: 'You are a helpful and friendly AI assistant. Keep your responses concise and conversational.'
    },
  });

  return sessionPromise;
}

export function stopConversation() {
  if (scriptProcessor) {
    scriptProcessor.disconnect();
  }
  if (microphoneStream) {
    microphoneStream.getTracks().forEach(track => track.stop());
  }
  if (inputAudioContext && inputAudioContext.state !== 'closed') {
    inputAudioContext.close();
  }
  if (outputAudioContext && outputAudioContext.state !== 'closed') {
    outputAudioContext.close();
  }
  for (const source of audioSources.values()) {
    source.stop();
  }
  audioSources.clear();
  nextStartTime = 0;
}
