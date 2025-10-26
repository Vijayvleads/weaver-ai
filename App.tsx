import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TemplateLibrary } from './components/TemplateLibrary';
import { Chatsonic } from './components/Chatsonic';
import { LongFormEditor } from './components/LongFormEditor';
import { Photosonic } from './components/Photosonic';
import { Audiosonic } from './components/Audiosonic';
import { TemplateGenerator } from './components/TemplateGenerator';
import { BlogWeaver } from './components/BlogWeaver';
import type { Template } from './types';

type View = 'library' | 'generator' | 'chatsonic' | 'editor' | 'photosonic' | 'audiosonic' | 'blogweaver';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('blogweaver');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentView('generator');
  };
  
  const handleBackToLibrary = () => {
    setSelectedTemplate(null);
    setCurrentView('library');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'library':
        return <TemplateLibrary onTemplateSelect={handleTemplateSelect} />;
      case 'generator':
        return selectedTemplate && <TemplateGenerator template={selectedTemplate} onBack={handleBackToLibrary} />;
      case 'chatsonic':
        return <Chatsonic />;
      case 'editor':
        return <LongFormEditor />;
      case 'photosonic':
        return <Photosonic />;
      case 'audiosonic':
        return <Audiosonic />;
      case 'blogweaver':
        return <BlogWeaver />;
      default:
        return <BlogWeaver />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;