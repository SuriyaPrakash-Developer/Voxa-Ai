import React from 'react';
import { MicrophoneIcon, SendIcon, StopIcon } from './icons';
import { User } from '../types';

interface Props {
  textInput: string;
  setTextInput: (v: string) => void;
  isConnecting: boolean;
  isRecording: boolean;
  handleSendText: () => void;
  handleStartConversation: () => void;
  handleStopConversation: () => void;
  user: User | null;
}

const FooterInput: React.FC<Props> = ({ textInput, setTextInput, isConnecting, isRecording, handleSendText, handleStartConversation, handleStopConversation, user }) => {
  return (
    <footer className="p-7 sm:p-4 backdrop-blur-sm flex-shrink-0">
      {isRecording ? (
        <div className="flex flex-col items-center">
          <button
            onClick={handleStopConversation}
            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-105 shadow-lg"
            aria-label="Stop recording"
          >
            <StopIcon className="w-6 sm:w-8 h-6 sm:h-8" />
          </button>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">Speak now... {` ${user?.name || ''}`} </p>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendText(); } }}
              placeholder={isConnecting ? "Thinking..." : "Type a message or use the mic 🎙️..."}
              disabled={isConnecting}
              className="w-full py-5  sm:py-5 px-4 sm:px-5 pr-10 sm:pr-12 text-md sm:text-sm bg-gray-50 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:bg-white focus:border-blue-300 transition-all text-black"
            />
            <button 
              onClick={textInput ? handleSendText : handleStartConversation}
              disabled={isConnecting}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label={textInput ? "Send message" : "Start voice chat"}
            >
              {textInput ? <SendIcon className="w-4 sm:w-5 h-4 sm:h-5" /> : <MicrophoneIcon className="w-4 sm:w-5 h-4 sm:h-5" />}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default FooterInput;
