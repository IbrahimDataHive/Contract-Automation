import React from 'react';
import { FileText, Code2, Sparkles, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'python';
  setActiveTab: (tab: 'studio' | 'python') => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGuide,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Vendor Contract Generator
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-500" />
                  Streamlit &amp; Web
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Automated document assembly from Excel datasets &amp; Word Jinja2 templates
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Guide */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1 border border-slate-200">
              <button
                id="tab-studio-btn"
                onClick={() => setActiveTab('studio')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'studio'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Interactive Studio</span>
              </button>
              <button
                id="tab-python-btn"
                onClick={() => setActiveTab('python')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'python'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Python &amp; CLI Code</span>
              </button>
            </div>

            <button
              id="open-guide-btn"
              onClick={onOpenGuide}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Template Guide</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
