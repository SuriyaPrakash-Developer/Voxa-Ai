
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import History from './pages/History';
import { AuthProvider } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthReady } = useAuth();
  // Wait for auth initialization (localStorage) before deciding.
  if (!isAuthReady) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/history" element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
