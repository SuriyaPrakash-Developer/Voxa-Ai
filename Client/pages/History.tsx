import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Conversation, TranscriptEntry } from '../types';
import { GeminiIcon, UserIcon } from '../components/icons';
import { MdArrowBack, MdAdd, MdDeleteOutline } from 'react-icons/md';

const HISTORY_STORAGE_KEY = 'gemini-conversation-history';
const LOCAL_STORAGE_KEY = 'gemini-voice-transcript';

const History: React.FC = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (saved) {
                setConversations(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    const handleBack = () => {
        if (selectedConversation) {
            setSelectedConversation(null);
        } else {
            navigate('/');
        }
    };

    const handleNewChat = () => {
        // Check if there's an active draft in local storage
        try {
            const draftJson = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (draftJson) {
                const transcript = JSON.parse(draftJson) as TranscriptEntry[];
                if (transcript.length > 0) {
                    // Save draft to history
                    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
                    const history: Conversation[] = historyJson ? JSON.parse(historyJson) : [];

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
                }
                // Clear the draft
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        } catch (e) {
            console.error("Error handling new chat:", e);
        }
        navigate('/');
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear all history?')) {
            localStorage.removeItem(HISTORY_STORAGE_KEY);
            setConversations([]);
        }
    };

    const deleteConversation = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Delete this conversation?')) {
            const updated = conversations.filter(c => c.id !== id);
            setConversations(updated);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
            if (selectedConversation?.id === id) {
                setSelectedConversation(null);
            }
        }
    };

    const TranscriptItem: React.FC<{ entry: TranscriptEntry }> = ({ entry }) => (
        <div className={`flex items-start gap-3 w-full ${entry.speaker === 'User' ? 'justify-end' : 'justify-start'}`}>
            {entry.speaker === 'Gemini' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><GeminiIcon className="w-5 h-5 text-gray-600" /></div>}
            <div className={`p-3 rounded-2xl max-w-lg shadow-sm ${entry.speaker === 'User' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg'}`}>
                <div className="prose prose-sm max-w-none text-inherit">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {entry.text}
                    </ReactMarkdown>
                </div>
            </div>
            {entry.speaker === 'User' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-gray-600" /></div>}
        </div>
    );

    return (
        <div className="h-screen bg-gray-50 font-sans flex flex-col">
            <header className="flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MdArrowBack className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {selectedConversation ? selectedConversation.title : 'Menu'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {!selectedConversation && (
                        <button
                            onClick={handleNewChat}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm"
                        >
                            <MdAdd className="h-4 w-4" />
                            New Chat
                        </button>
                    )}
                    {!selectedConversation && conversations.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto">
                    {selectedConversation ? (
                        <div className="space-y-6">
                            <div className="text-center text-gray-500 text-sm mb-6">
                                {new Date(selectedConversation.createdAt).toLocaleString()}
                            </div>
                            {selectedConversation.transcript.map((entry, index) => (
                                <TranscriptItem key={index} entry={entry} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {conversations.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20">
                                    <p>No history available.</p>
                                </div>
                            ) : (
                                conversations.slice().reverse().map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group relative flex flex-col gap-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                                {new Date(conv.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="relative pl-3 border-l-2 border-blue-500">
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-0.5">Input</span>
                                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                    {conv.transcript.find(t => t.speaker === 'User')?.text || 'No input'}
                                                </p>
                                            </div>

                                            <div className="relative pl-3 border-l-2 border-purple-500">
                                                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-0.5">Output</span>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {conv.transcript.find(t => t.speaker === 'Gemini')?.text || 'No response'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => deleteConversation(e, conv.id)}
                                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-full"
                                            title="Delete"
                                        >
                                            <MdDeleteOutline className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;
