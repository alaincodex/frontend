import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./components/Home";
import FlashcardList from "./components/FlashcardList";
import Folders from "./components/Folders";
import UploadPDF from "./components/UploadPDF";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ThemeToggle from "./components/ThemeToggle";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return <p>Loading...</p>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const [user] = useAuthState(auth);
  const isDark = localStorage.getItem("theme") === "dark";

  return (
    <div className={`${isDark ? "dark" : ""} h-screen w-screen overflow-hidden`}>
      <Router>
        <div className="flex flex-col md:flex-row h-full w-full">
          {/* Mobile Top Bar */}
          {user && (
            <div className="md:hidden flex justify-between items-center bg-gray-900 text-white p-4">
              <span className="font-bold">📚 StudyApp</span>
              <button
                onClick={() => signOut(auth)}
                className="text-sm text-red-300"
              >
                🚪 Logout
              </button>
            </div>
          )}

          {/* Sidebar - Hidden on Mobile */}
          <div className="w-full md:w-48 bg-gray-900 text-white p-4 space-y-4 overflow-y-auto hidden md:block">
            <h1 className="text-xl font-bold mb-6">📚 StudyApp</h1>
            <ThemeToggle />
            {user && (
              <>
                <p className="text-sm text-gray-300 mb-2">Hi, {user.email}</p>
                <button
                  onClick={() => signOut(auth)}
                  className="text-sm text-red-400 hover:text-red-600"
                >
                  🚪 Logout
                </button>
              </>
            )}
            <Link to="/" className="block hover:text-yellow-300">🏠 Home</Link>
            <Link to="/flashcards" className="block hover:text-yellow-300">🃏 Flashcards</Link>
            <Link to="/folders" className="block hover:text-yellow-300">📁 Folders</Link>
            <Link to="/upload" className="block hover:text-yellow-300">📄 Upload PDFs</Link>
            {!user && (
              <>
                <Link to="/login" className="block hover:text-yellow-300">🔐 Login</Link>
                <Link to="/signup" className="block hover:text-yellow-300">✍️ Sign Up</Link>
              </>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 h-full overflow-auto p-4 sm:p-6 bg-gray-100 dark:bg-gray-800">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/flashcards" element={<PrivateRoute><FlashcardList /></PrivateRoute>} />
              <Route path="/folders" element={<PrivateRoute><Folders /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><UploadPDF /></PrivateRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
