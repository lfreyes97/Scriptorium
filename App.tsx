
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainChat from './components/MainChat';
import EditorView from './components/EditorView';
import CalendarView from './components/CalendarView';
import TranslationView from './components/TranslationView';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import FeatureTrackerView from './components/FeatureTrackerView';
import TutorialsView from './components/TutorialsView';
import NewspaperView from './components/NewspaperView';
import OCRView from './components/OCRView';
import AudioStudioView from './components/AudioStudioView';
import MockupGeneratorView from './components/MockupGeneratorView';
import TaskManagerView from './components/TaskManagerView';
import ProjectManagerView from './components/ProjectManagerView';
import WorkflowStudioView from './components/WorkflowStudioView';
import NotesView from './components/NotesView';
import EbookReaderView from './components/EbookReaderView';
import SettingsView from './components/SettingsView';
import CommandMenu from './components/CommandMenu';
import PluginActionOverlay from './components/PluginActionOverlay';
import { SidebarTab } from './types';
import { fileSystem } from './services/fileSystem';
import { UserService } from './services/userService';

const App = () => {
  // Central State for View Routing
  const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.Dashboard);
  // Using a key to force re-render and reset state of MainChat for "New Chat" functionality
  const [chatSessionId, setChatSessionId] = useState(Date.now());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentUser] = useState(UserService.getCurrentUser());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNewChat = () => {
    // If we are on dashboard, reset it. If not, go to dashboard then reset.
    if (activeTab !== SidebarTab.Dashboard) {
      setActiveTab(SidebarTab.Dashboard);
    }
    setTimeout(() => setChatSessionId(Date.now()), 10);
  };

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case SidebarTab.Dashboard:
        return <MainChat key={chatSessionId} />;
      case SidebarTab.Editor:
        return <div className="flex-1 h-screen relative bg-background"><EditorView onBack={() => setActiveTab(SidebarTab.Dashboard)} /></div>;
      case SidebarTab.Calendar:
        return <CalendarView />;
      case SidebarTab.Translation:
        return <TranslationView />;
      case SidebarTab.KnowledgeBase:
        return <KnowledgeBaseView />;
      case SidebarTab.FeatureTracker:
        return <FeatureTrackerView />;
      case SidebarTab.Tutorials:
        return <TutorialsView />;
      case SidebarTab.Newspaper:
        return <NewspaperView />;
      case SidebarTab.OCR:
        return <OCRView />;
      case SidebarTab.Audio:
        return <AudioStudioView />;
      case SidebarTab.Mockup:
        return <MockupGeneratorView />;
      case SidebarTab.WorkflowStudio:
        return <WorkflowStudioView />;
      case SidebarTab.TaskManager:
        return <TaskManagerView />;
      case SidebarTab.ProjectManager:
        return <ProjectManagerView />;
      case SidebarTab.Notes:
        return <NotesView />;
      case SidebarTab.Reader:
        return <EbookReaderView />;
      case SidebarTab.Settings:
        return <SettingsView />;
      default:
        return <MainChat />;
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-background text-foreground transition-colors duration-300">

      {/* Global Command Menu */}
      <CommandMenu
        activeTab={activeTab}
        onNavigate={handleTabChange}
        onThemeToggle={toggleTheme}
        onNewChat={handleNewChat}
      />

      {/* Global Plugin Action Overlay (Transversal Tools) */}
      <PluginActionOverlay />

      <Sidebar
        onNewChat={handleNewChat}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
      />

      {/* View Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-secondary/30">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default App;
