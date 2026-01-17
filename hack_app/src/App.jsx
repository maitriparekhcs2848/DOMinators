import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages (function placeholders for now to verify build)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Consent from './pages/Consent';
import AccessLogs from './pages/AccessLogs';
import HealthApp from './pages/HealthApp';

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/consent" element={
                <ProtectedRoute>
                  <Layout>
                    <Consent />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/access-logs" element={
                <ProtectedRoute>
                  <Layout>
                    <AccessLogs />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/health-app" element={
                <ProtectedRoute>
                  <Layout>
                    <HealthApp />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
