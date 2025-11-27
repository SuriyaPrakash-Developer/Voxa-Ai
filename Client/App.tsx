
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from './context/AuthContext';
import { ConnectionState, TranscriptEntry, LiveSession, Conversation } from './types';
import { startConversation, stopConversation } from './services/geminiService';
import { MdMic, MdStop, MdAutoAwesome, MdPerson, MdSend, MdRefresh, MdMenu } from 'react-icons/md';
import { GoogleGenAI } from '@google/genai';
import Sidebar from './components/Sidebar';


const LOCAL_STORAGE_KEY = 'gemini-voice-transcript';
const HISTORY_STORAGE_KEY = 'gemini-conversation-history';

const App: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimUserText, setInterimUserText] = useState('');
  const [interimGeminiText, setInterimGeminiText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const liveSessionRef = useRef<LiveSession | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const isRecording = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;
  const isIdle = connectionState === ConnectionState.IDLE || connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;

  // --- Conversation Management ---

  const saveToHistory = useCallback(() => {
    if (transcript.length === 0) return;

    try {
      const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
      const history: Conversation[] = historyJson ? JSON.parse(historyJson) : [];

      // Generate a title based on the first user message
      const firstUserMessage = transcript.find(t => t.speaker === 'User');
      const title = firstUserMessage ? firstUserMessage.text.slice(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '') : 'New Conversation';

      const newConversation: Conversation = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        title,
        transcript: [...transcript],
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [newConversation, ...history];
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [transcript]);

  // Conversation management functions
  const handleNewConversation = useCallback(() => {
    saveToHistory();
    handleStopConversation();
    setTranscript([]);
    setError(null);
    setInterimUserText('');
    setInterimGeminiText('');
  }, [saveToHistory]);

  const handleStopConversation = useCallback(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    stopConversation();
    setConnectionState(ConnectionState.IDLE);
  }, []);

  const handleClearHistory = useCallback(() => {
    saveToHistory();
    setIsClearingHistory(true);
    handleStopConversation();
    setTranscript([]);
    setError(null);
    setInterimUserText('');
    setInterimGeminiText('');
    setTimeout(() => setIsClearingHistory(false), 1000);
  }, [handleStopConversation, saveToHistory]);

  const handleSelectConversation = (conversation: Conversation) => {
    saveToHistory(); // Save current before switching
    handleStopConversation();
    setTranscript(conversation.transcript);
    setError(null);
  };

  // Load saved transcript from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const savedTranscript = JSON.parse(saved) as TranscriptEntry[];
        if (savedTranscript.length > 0) {
          setTranscript(savedTranscript);
        }
      }
    } catch (e) {
      console.error("Failed to load transcript from localStorage.", e);
    }
  }, []);

  // Save transcript to localStorage whenever it changes
  useEffect(() => {
    if (transcript.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transcript));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [transcript]);

  const handleSendText = async () => {
    const textToSend = textInput.trim();
    if (!textToSend) return;

    const userMessage: TranscriptEntry = { speaker: 'User', text: textToSend };
    setTranscript(prev => [...prev, userMessage]);
    setTextInput('');
    setConnectionState(ConnectionState.CONNECTING);

    try {
      let apiKey = import.meta.env.VITE_API_KEY as string | undefined;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        try {
          const response = await fetch('http://localhost:3001/server/.env');
          if (response.ok) {
            const data = await response.json();
            apiKey = data.apiKey;
          }
        } catch (error) {
          console.error("Failed to fetch API key from server:", error);
        }
      }
      if (!apiKey || apiKey === 'http://localhost:3001/server/.env') throw new Error("VITE_API_KEY environment variable not set.");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: textToSend });
      const geminiMessage: TranscriptEntry = { speaker: 'Gemini', text: response.text };
      setTranscript(prev => [...prev, geminiMessage]);
    } catch (e: any) {
      setError(e.message);
      const geminiError: TranscriptEntry = { speaker: 'Gemini', text: "Sorry, I encountered an error." };
      setTranscript(prev => [...prev, geminiError]);
    } finally {
      setConnectionState(ConnectionState.IDLE);
    }
  };

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [transcript, interimUserText, interimGeminiText]);

  const handleTranscriptUpdate = useCallback((entry: TranscriptEntry, isFinal: boolean) => {
    if (isFinal) {
      if (entry.speaker === 'User') {
        setInterimUserText('');
        if (entry.text.trim()) {
          setTranscript(prev => [...prev, entry]);
        }
      } else {
        setInterimGeminiText('');
        if (entry.text.trim()) {
          setTranscript(prev => [...prev, entry]);
        }
      }
    } else {
      if (entry.speaker === 'User') {
        setInterimGeminiText('');
        setInterimUserText(prev => prev + entry.text);
      } else {
        setInterimGeminiText(prev => prev + entry.text);
      }
    }
  }, []);

  const handleStartConversation = async () => {
    setError(null);
    setInterimUserText('');
    setInterimGeminiText('');
    try {
      liveSessionRef.current = await startConversation({
        onConnectionStateChange: setConnectionState,
        onTranscriptUpdate: handleTranscriptUpdate,
        onError: (e) => setError(e.message.trim()),
      });
    } catch (e: any) {
      setError(e.message.trim());
      setConnectionState(ConnectionState.ERROR);
    }
  };

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) liveSessionRef.current.close();
      stopConversation();
    };
  }, []);

  const TranscriptItem: React.FC<{ entry: TranscriptEntry }> = ({ entry }) => (
    <div className={`flex items-start gap-3 w-full ${entry.speaker === 'User' ? 'justify-end' : 'justify-start'}`}>
      {entry.speaker === 'Gemini' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><MdAutoAwesome className="w-5 h-5 text-gray-600" /></div>}
      <div className={`p-3 rounded-2xl max-w-lg shadow-sm ${entry.speaker === 'User' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg'}`}>
        <div className="prose prose-sm max-w-none text-inherit">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.text}
          </ReactMarkdown>
        </div>
      </div>
      {entry.speaker === 'User' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><MdPerson className="w-5 h-5 text-gray-600" /></div>}
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 font-sans">
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewConversation}
      />

      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-1 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Menu"
            >
              <MdMenu className="w-6 h-6" />
            </button>
            <MdAutoAwesome className="w-6 sm:w-7 h-6 sm:h-7 text-blue-500 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
              {user ? `${user.name}'s Voxa AI` : 'Gemini Voice Assistant'}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-colors ${connectionState === ConnectionState.CONNECTED ? 'bg-green-500' : connectionState === ConnectionState.CONNECTING ? 'bg-yellow-500 animate-pulse' : connectionState === ConnectionState.ERROR ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs sm:text-sm text-gray-600 capitalize">{connectionState.toLowerCase()}</span>
            </div>
            <button
              onClick={handleClearHistory}
              className="p-1 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
              title="New Conversation"
            >
              <MdRefresh className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-gray-100 px-2 sm:px-3 py-1 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                Sign Out
              </button>
            ) : (
              <a
                href="/login"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-gray-100 px-2 sm:px-3 py-1 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                Sign In
              </a>
            )}
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 rounded-xl p-4 sm:p-6">
            {isClearingHistory ? (
              <div className="text-center text-gray-500 mt-8 sm:mt-16">
                <MdRefresh className="w-12 sm:w-16 h-12 sm:h-16 mx-auto animate-spin text-blue-500" />
                <p className="mt-2 sm:mt-4 text-base sm:text-lg">Starting new conversation...</p>
              </div>
            ) : (
              <>
                {transcript.length === 0 && !interimUserText && !interimGeminiText && isIdle && (
                  <div className="text-center text-gray-500 mt-8 sm:mt-16">
                    <MdAutoAwesome className="w-12 sm:w-16 h-12 sm:h-16 mx-auto text-gray-300" />
                    <p className="mt-2 sm:mt-4 text-base sm:text-lg">Start a conversation with Voxa AI</p>
                    <p className="text-xs sm:text-sm">Enjoy your valuable time🙂💖</p>
                  </div>
                )}
                {transcript.map((entry, index) => <TranscriptItem key={index} entry={entry} />)}
                {interimUserText && <TranscriptItem entry={{ speaker: 'User', text: interimUserText }} />}
                {interimGeminiText && <TranscriptItem entry={{ speaker: 'Gemini', text: interimGeminiText }} />}
                <div ref={transcriptEndRef} />
              </>
            )}
          </div>
        </main>

        {error && (
          <div className="p-2 sm:p-3 bg-red-100 border-t border-red-200 text-center flex-shrink-0">
            <p className="text-xs sm:text-sm text-red-700">Error: {error}</p>
          </div>
        )}

        <footer className="p-3 sm:p-4 backdrop-blur-sm flex-shrink-0">
          {isRecording ? (
            <div className="flex flex-col items-center">
              <button
                onClick={handleStopConversation}
                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-105 shadow-lg"
                aria-label="Stop recording"
              >
                <MdStop className="w-6 sm:w-8 h-6 sm:h-8" />
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendText();
                    }
                  }}
                  placeholder={isConnecting ? "Thinking..." : "Type a message or use the mic 🎙️..."}
                  disabled={isConnecting}
                  className="w-full py-2 sm:py-3 px-4 sm:px-5 pr-10 sm:pr-12 text-xs sm:text-sm bg-gray-50 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:bg-white focus:border-blue-300 transition-all text-black"
                />
                <button
                  onClick={textInput ? handleSendText : handleStartConversation}
                  disabled={isConnecting}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  aria-label={textInput ? "Send message" : "Start voice chat"}
                >
                  {textInput ? <MdSend className="w-4 sm:w-5 h-4 sm:h-5" /> : <MdMic className="w-4 sm:w-5 h-4 sm:h-5" />}
                </button>
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default App;
