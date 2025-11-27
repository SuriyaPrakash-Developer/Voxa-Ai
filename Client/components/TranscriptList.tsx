import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TranscriptEntry } from '../types';
import { GeminiIcon, UserIcon } from './icons';

const TranscriptItem: React.FC<{ entry: TranscriptEntry }> = ({ entry }) => (
  <div className={`flex items-start gap-3 w-full ${entry.speaker === 'User' ? 'justify-end' : 'justify-start'}`}>
      {entry.speaker === 'Gemini' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><GeminiIcon className="w-5 h-5 text-gray-600" /></div>}
      <div className={`p-3 rounded-2xl max-w-lg shadow-sm ${ entry.speaker === 'User' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg' }`}>
          <div className="prose prose-sm max-w-none text-inherit">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.text}</ReactMarkdown>
          </div>
      </div>
      {entry.speaker === 'User' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-gray-600" /></div>}
  </div>
);

interface Props {
  transcript: TranscriptEntry[];
  interimUserText: string;
  interimGeminiText: string;
}

const TranscriptList: React.FC<Props> = ({ transcript, interimUserText, interimGeminiText }) => {
  return (
    <>
      {transcript.map((entry, index) => <TranscriptItem key={index} entry={entry} />)}
      {interimUserText && <TranscriptItem entry={{ speaker: 'User', text: interimUserText }} />}
      {interimGeminiText && <TranscriptItem entry={{ speaker: 'Gemini', text: interimGeminiText }} />}
    </>
  );
};

export default TranscriptList;
