import React from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import StudentRegistration from './components/StudentRegistration';
import Layout from './components/Layout';
import SecurityDashboard from './components/dashboards/SecurityDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';

function App() {
  const { user, staff, student, userType, loading } = useAuth();
  const [showRegistration, setShowRegistration] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showRegistration) {
      return <StudentRegistration onBack={() => setShowRegistration(false)} />;
    }
    return <Login onShowRegistration={() => setShowRegistration(true)} />;
  }

  if (!userType) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Setup Required</h2>
          <p className="text-gray-600 mb-4">
            Your account exists but is not properly configured. Please contact the administrator.
          </p>
          <p className="text-sm text-gray-500">Email: {user.email}</p>
        </div>
      </Layout>
    );
  }

  const renderDashboard = () => {
    if (userType === 'staff' && staff) {
      switch (staff.role) {
        case 'security':
          return <SecurityDashboard />;
        case 'teacher':
          return <TeacherDashboard />;
        case 'admin':
          return <AdminDashboard />;
        case 'doctor':
          return <AdminDashboard />; // Doctors get admin access for now
        case 'assistant':
          return <AdminDashboard />; // Assistants get admin access for now
        default:
          return (
            <div className="max-w-2xl mx-auto p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h2>
              <p className="text-gray-600">Your staff role is not recognized.</p>
            </div>
          );
      }
    } else if (userType === 'student' && student) {
      return <StudentDashboard />;
    }

    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Error</h2>
        <p className="text-gray-600">Unable to determine your access level.</p>
      </div>
    );
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
}

export default App;