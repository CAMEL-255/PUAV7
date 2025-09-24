import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Shield, GraduationCap, Users, User, Stethoscope } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { staff, student, userType, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'teacher':
        return <GraduationCap className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'doctor':
        return <Stethoscope className="h-5 w-5" />;
      case 'assistant':
        return <Users className="h-5 w-5" />;
      case 'student':
        return <User className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      case 'security':
        return 'bg-orange-100 text-orange-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'assistant':
        return 'bg-indigo-100 text-indigo-800';
      case 'student':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentUser = staff || student;
  const currentRole = userType === 'staff' ? staff?.role : 'student';
  const displayName = staff?.name || (student ? `${student.first_name} ${student.last_name}` : 'User');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                University Attendance
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(currentRole || '')}`}>
                        {getRoleIcon(currentRole || '')}
                        {currentRole?.charAt(0).toUpperCase() + currentRole?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}