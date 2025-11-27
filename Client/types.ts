export enum ConnectionState {
  IDLE = 'Idle',
  CONNECTING = 'Connecting...',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  ERROR = 'Error',
}

export interface TranscriptEntry {
  speaker: 'User' | 'Gemini';
  text: string;
}

export interface Conversation {
  id: string;
  title: string;
  transcript: TranscriptEntry[];
  createdAt: string;
  updatedAt?: string;
}

export type LiveSession = {
  sendRealtimeInput: (input: { media: { data: string; mimeType: string; }; }) => void;
  sendToolResponse: (response: { functionResponses: { id: string; name: string; response: { result: any; }; }; }) => void;
  close: () => void;
};

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  // Indicates whether the auth state has been initialized (localStorage checked)
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (user: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}