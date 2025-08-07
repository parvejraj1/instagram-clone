import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./theme.css";
import { StreamTab } from "./StreamTab";
import { MyPhotosTab } from "./MyPhotosTab";
import { UploadTab } from "./UploadTab";
import { UserSearchTab } from "./UserSearchTab";
import { SignInPage } from "./SignInPage";
import { SignUpPage } from "./SignUpPage";
import { ThemeContext, darkThemeClasses, lightThemeClasses } from "./ThemeContext";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    // If not authenticated, clear any stale data
    if (!isAuth) {
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
    }
    return isAuth;
  });
  const [activeTab, setActiveTab] = useState<"stream" | "upload" | "my-photos" | "search">("stream");
  const tabs = ["stream", "upload", "my-photos", "search"] as const;

  // Reset to stream tab when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab("stream");
    }
  }, [isAuthenticated]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const savedMode = localStorage.getItem('darkMode');
    const shouldBeDark = savedMode !== null ? JSON.parse(savedMode) : true;
    
    if (shouldBeDark && !isCurrentlyDark) {
      document.documentElement.classList.add('dark');
    } else if (!shouldBeDark && isCurrentlyDark) {
      document.documentElement.classList.remove('dark');
    }
    
    return shouldBeDark;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    setActiveTab("stream"); // Ensure we start at the stream tab
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear all authentication data
    localStorage.clear();
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <Router>
      <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) }}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/app" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/app" replace />
              ) : (
                <SignInPage onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/sign-up" 
            element={
              isAuthenticated ? (
                <Navigate to="/app" replace />
              ) : (
                <SignUpPage onLogin={handleLogin} />
              )
            } 
          />
          <Route
            path="/app"
            element={
              isAuthenticated ? (
                <div className={`min-h-screen flex flex-col ${isDarkMode ? darkThemeClasses.bg.primary : 'bg-gray-50'} transition-colors duration-200`}>
                  <header className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4 ${isDarkMode ? 'border-gray-700' : ''}`}>
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>PhotoShare</h2>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-colors`}
                      >
                        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </header>
                  <main className="flex-1 p-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-6">
                        <div className={`flex space-x-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-1 shadow-sm border ${isDarkMode ? 'border-gray-700' : ''}`}>
                          {['stream', 'upload', 'my-photos', 'search'].map((tab) => (
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
                               tab === 'upload' ? 'Upload' : 
                               tab === 'search' ? 'Search Users' : 'My Photos'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : ''}`}>
                        {activeTab === "stream" && <StreamTab isDarkMode={isDarkMode} />}
                        {activeTab === "upload" && <UploadTab isDarkMode={isDarkMode} onUploadComplete={() => setActiveTab("stream")} />}
                        {activeTab === "my-photos" && <MyPhotosTab isDarkMode={isDarkMode} />}
                        {activeTab === "search" && <UserSearchTab />}
                      </div>
                    </div>
                  </main>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
        <Toaster />
      </ThemeContext.Provider>
    </Router>
  );
}