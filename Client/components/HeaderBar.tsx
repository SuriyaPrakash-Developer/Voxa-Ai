import React from 'react';
import { User, ConnectionState } from '../types';
import { GeminiIcon, MenuIcon, XIcon } from './icons';

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  connectionState: ConnectionState;
}

const HeaderBar: React.FC<Props> = ({ isSidebarOpen, setIsSidebarOpen, user, isAuthenticated, logout, connectionState }) => {
  return (
    <header className="flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-gray-500 hover:text-gray-800 md:hidden flex-shrink-0">
          {isSidebarOpen ? <XIcon className="w-5 sm:w-6 h-5 sm:h-6" /> : <MenuIcon className="w-5 sm:w-6 h-5 sm:h-6" />}
        </button>
        <GeminiIcon className="w-6 sm:w-7 h-6 sm:h-7 text-blue-500 flex-shrink-0" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
          {user ? `${user.name}'s Voxa AI` : 'Gemini Voice Assistant'}
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        <div className="hidden sm:flex items-center space-x-2">
          <div className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-colors ${ connectionState === ConnectionState.CONNECTED ? 'bg-green-500' : connectionState === ConnectionState.CONNECTING ? 'bg-yellow-500 animate-pulse' : connectionState === ConnectionState.ERROR ? 'bg-red-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs sm:text-sm text-gray-600 capitalize">{String(connectionState).toLowerCase()}</span>
        </div>
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
  );
};

export default HeaderBar;
