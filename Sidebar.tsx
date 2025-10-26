import React from 'react';
import {
  SparklesIcon,
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  CodeBracketSquareIcon,
  GlobeAltIcon,
} from './icons/Icons';

interface SidebarProps {
  setCurrentView: (view: 'library' | 'chatsonic' | 'editor' | 'photosonic' | 'audiosonic' | 'blogweaver') => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors duration-150"
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ setCurrentView }) => {
  return (
    <div className="flex flex-col w-64 bg-slate-800 border-r border-slate-700">
      <div className="flex items-center justify-center h-16 border-b border-slate-700">
        <SparklesIcon className="h-8 w-8 text-teal-400" />
        <span className="ml-2 text-xl font-bold text-white">Weaver AI</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="flex flex-col space-y-2">
          <NavItem icon={<GlobeAltIcon className="h-6 w-6" />} label="Article Weaver" onClick={() => setCurrentView('blogweaver')} />
          <NavItem icon={<NewspaperIcon className="h-6 w-6" />} label="Templates" onClick={() => setCurrentView('library')} />
          <NavItem icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />} label="Chat" onClick={() => setCurrentView('chatsonic')} />
          <NavItem icon={<CodeBracketSquareIcon className="h-6 w-6" />} label="Long-Form Editor" onClick={() => setCurrentView('editor')} />
          <NavItem icon={<PhotoIcon className="h-6 w-6" />} label="Image Generation" onClick={() => setCurrentView('photosonic')} />
          <NavItem icon={<SpeakerWaveIcon className="h-6 w-6" />} label="Text-to-Speech" onClick={() => setCurrentView('audiosonic')} />
        </nav>
      </div>
    </div>
  );
};