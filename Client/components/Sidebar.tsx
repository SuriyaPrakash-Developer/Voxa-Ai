import React, { useEffect, useState } from 'react';
import { Conversation } from '../types';
import { MdClose, MdAdd, MdChatBubbleOutline, MdDeleteOutline } from 'react-icons/md';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectConversation: (conversation: Conversation) => void;
    onNewChat: () => void;
}

const HISTORY_STORAGE_KEY = 'gemini-conversation-history';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onSelectConversation, onNewChat }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (isOpen) {
            try {
                const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
                if (saved) {
                    setConversations(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, [isOpen]);

    const deleteConversation = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Delete this conversation?')) {
            const updated = conversations.filter(c => c.id !== id);
            setConversations(updated);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[260px] bg-gray-50 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <MdClose className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="px-4 pb-4">
                    <button
                        onClick={() => { onNewChat(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium text-sm"
                    >
                        <MdAdd className="h-5 w-5" />
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Recent</div>
                    {conversations.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No history yet.
                        </div>
                    ) : (
                        conversations.slice().reverse().map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => { onSelectConversation(conv); onClose(); }}
                                className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors relative"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MdChatBubbleOutline className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 truncate">{conv.title}</span>
                                </div>

                                <button
                                    onClick={(e) => deleteConversation(e, conv.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded text-gray-500 hover:text-red-500 transition-all"
                                    title="Delete"
                                >
                                    <MdDeleteOutline className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 text-xs text-center text-gray-500">
                    &copy; {new Date().getFullYear()} Voxa AI
                </div>
            </div>
        </>
    );
};

export default Sidebar;
