// Trigger Vercel production deployment
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { MatchProvider } from './contexts/MatchContext';
import Navigation from './components/Navigation';
import AppRoutes from './components/AppRoutes';
import ToastContainer from './components/ToastContainer';
import AdminTools from './components/AdminTools';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <MatchProvider>
            <div className="app">
              <Navigation />
              <AppRoutes />
              <ToastContainer />
              <AdminTools />
            </div>
          </MatchProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;


