import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  BarChart3,
  CreditCard
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  scanned_at: string;
  status: string;
  lecture: {
    title: string;
    course: {
      course_code: string;
      title: string;
    };
  } | null;
  gateway: {
    display_name: string;
    location: string;
  } | null;
}

interface StudentCard {
  id: string;
  card_uid: string;
  is_active: boolean;
}

export default function StudentDashboard() {
  const { student } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [studentCards, setStudentCards] = useState<StudentCard[]>([]);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    lectureAttendance: 0,
    gateEntries: 0,
    thisWeekAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      fetchAttendanceRecords();
      fetchStudentCards();
    }
  }, [student]);

  const fetchAttendanceRecords = async () => {
    if (!student) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          lectures:lecture_id (
            title,
            courses:course_id (
              course_code,
              title
            )
          ),
          gateways:gateway_id (
            display_name,
            location
          )
        `)
        .eq('student_id', student.id)
        .order('scanned_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const records = data.map(record => ({
        ...record,
        lecture: record.lectures,
        gateway: record.gateways,
      }));

      setAttendanceRecords(records);

      // Calculate stats
      const total = data.length;
      const lectures = data.filter(r => r.lecture_id).length;
      const gates = data.filter(r => !r.lecture_id).length;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeek = data.filter(r => new Date(r.scanned_at) >= oneWeekAgo).length;

      setStats({
        totalAttendance: total,
        lectureAttendance: lectures,
        gateEntries: gates,
        thisWeekAttendance: thisWeek,
      });
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCards = async () => {
    if (!student) return;

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('student_id', student.id);

      if (error) throw error;
      setStudentCards(data || []);
    } catch (error) {
      console.error('Error fetching student cards:', error);
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Student information not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {student.first_name}!</p>
      </div>

      {/* Student Profile */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-gray-600">ID: {student.student_id}</p>
            <p className="text-sm text-gray-500">
              {student.faculty} - {student.department}
            </p>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAttendance}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lecture Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lectureAttendance}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gate Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.gateEntries}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeekAttendance}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* NFC Cards */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Your NFC Cards</h3>
        </div>

        {studentCards.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No NFC cards registered</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {studentCards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">Card UID</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    card.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {card.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="font-mono text-sm text-gray-600">{card.card_uid}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
        </div>

        {attendanceRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No attendance records found</p>
        ) : (
          <div className="space-y-3">
            {attendanceRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {record.lecture 
                        ? `${record.lecture.course.course_code} - ${record.lecture.title}`
                        : record.gateway?.display_name || 'Campus Entry'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {record.gateway?.location || 'Campus Gate'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTime(record.scanned_at)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}