import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import FeedPage from './pages/FeedPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
        <AuthModal />
      </Router>
    </AuthProvider>
  );
};

export default App;