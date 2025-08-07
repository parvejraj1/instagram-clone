import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import "./theme.css";
import { StreamTab } from "./StreamTab";
import { MyPhotosTab } from "./MyPhotosTab";
import { UploadTab } from "./UploadTab";
import { ThemeContext, darkThemeClasses, lightThemeClasses } from "./ThemeContext";

export default function App() {
  const [activeTab, setActiveTab] = useState<"stream" | "upload" | "my-photos">("stream");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) }}>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? darkThemeClasses.bg.primary : 'bg-gray-50'} transition-colors duration-200`}>
      <header className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4 ${isDarkMode ? 'border-gray-700' : ''}`}>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>PhotoShare</h2>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-colors`}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
              Welcome to PhotoShare!
            </h1>
            <div className={`flex space-x-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-1 shadow-sm border ${isDarkMode ? 'border-gray-700' : ''}`}>
              {['stream', 'upload', 'my-photos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {tab === 'stream' ? 'Stream' : 
                   tab === 'upload' ? 'Upload' : 'My Photos'}
                </button>
              ))}
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : ''}`}>
            {activeTab === "stream" && <StreamTab isDarkMode={isDarkMode} />}
            {activeTab === "upload" && <UploadTab isDarkMode={isDarkMode} onUploadComplete={() => setActiveTab("stream")} />}
            {activeTab === "my-photos" && <MyPhotosTab isDarkMode={isDarkMode} />}
          </div>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
    );
  }