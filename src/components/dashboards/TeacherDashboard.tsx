import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  Scan,
  Users,
  BookOpen,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Course {
  id: string;
  course_code: string;
  title: string;
  faculty: string;
  department: string;
}

interface Lecture {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  course: Course;
}

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  faculty: string;
  department: string;
}

interface Attendee {
  id: string;
  scanned_at: string;
  status: string;
  student: Student;
}

export default function TeacherDashboard() {
  const { staff } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [cardUid, setCardUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (staff) {
      fetchLectures();
    }
  }, [staff]);

  useEffect(() => {
    if (selectedLecture) {
      fetchAttendees();
    }
  }, [selectedLecture]);

  const fetchLectures = async () => {
    try {
      const { data, error } = await supabase
        .from('lectures')
        .select(
          `
          *,
          courses (*)
        `
        )
        .eq('staff_id', staff?.id)
        .in('status', ['scheduled', 'active'])
        .order('start_time', { ascending: true });

      if (error) throw error;

      setLectures(
        data.map((lecture) => ({
          ...lecture,
          course: lecture.courses as Course,
        }))
      );
    } catch (error) {
      console.error('Error fetching lectures:', error);
    }
  };

  const fetchAttendees = async () => {
    if (!selectedLecture) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(
          `
          *,
          students:student_id (*)
        `
        )
        .eq('lecture_id', selectedLecture.id)
        .order('scanned_at', { ascending: false });

      if (error) throw error;

      setAttendees(
        data.map((attendance) => ({
          ...attendance,
          student: attendance.students as Student,
        }))
      );
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  const handleScan = async () => {
    if (!cardUid.trim()) {
      setError('Please enter a card UID');
      return;
    }

    if (!selectedLecture) {
      setError('Please select a lecture first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          card_uid: cardUid,
          device_code: 'DEV002', // Different device for teacher
          gateway_code: 'CLASSROOM_01', // Classroom gateway
          lecture_id: selectedLecture.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'student_not_found') {
          throw new Error('Student not found. Please ensure the card UID matches a registered student ID.');
        } else if (result.error === 'already_recorded') {
          throw new Error('Student already marked as present for this lecture');
        } else if (result.error === 'gateway_or_device_not_found') {
          throw new Error('Gateway or device not configured properly.');
        } else {
          throw new Error(result.error || 'Scan failed');
        }
      }

      const message = result.card_created 
        ? `New card registered and attendance recorded for ${result.student.first_name} ${result.student.last_name}`
        : `Attendance recorded for ${result.student.first_name} ${result.student.last_name}`;
      setSuccess(message);
      setCardUid('');
      await fetchAttendees();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const startLecture = async (lecture: Lecture) => {
    try {
      const { error } = await supabase
        .from('lectures')
        .update({ status: 'active' })
        .eq('id', lecture.id);

      if (error) throw error;

      await fetchLectures();
      setSelectedLecture({ ...lecture, status: 'active' });
    } catch (error) {
      setError('Failed to start lecture');
    }
  };

  const endLecture = async (lecture: Lecture) => {
    try {
      const { error } = await supabase
        .from('lectures')
        .update({ status: 'completed' })
        .eq('id', lecture.id);

      if (error) throw error;

      await fetchLectures();
      setSelectedLecture(null);
    } catch (error) {
      setError('Failed to end lecture');
    }
  };

  const quickScan = (uid: string) => {
    setCardUid(uid);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Manage lecture attendance</p>
      </div>

      {/* Lecture Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Your Lectures</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedLecture?.id === lecture.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
              onClick={() => setSelectedLecture(lecture)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lecture.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {lecture.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {lecture.course.course_code} - {lecture.course.title}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {formatDateTime(lecture.start_time)}
              </div>

              <div className="mt-3 flex gap-2">
                {lecture.status === 'scheduled' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startLecture(lecture);
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start
                  </button>
                )}
                {lecture.status === 'active' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      endLecture(lecture);
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                  >
                    End
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {lectures.length === 0 && (
          <p className="text-gray-500 text-center py-4">No upcoming lectures</p>
        )}
      </div>

      {/* NFC Scanner */}
      {selectedLecture && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scan className="h-5 w-5 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Attendance Scanner
            </h3>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">
              <strong>Active Lecture:</strong> {selectedLecture.title}
            </p>
            <p className="text-green-700 text-sm">
              {selectedLecture.course.course_code} -{' '}
              {selectedLecture.course.title}
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label
                htmlFor="cardUid"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Student Card UID
              </label>
              <input
                id="cardUid"
                type="text"
                placeholder="Scan or enter card UID"
                value={cardUid}
                onChange={(e) => setCardUid(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>

            <button
              onClick={handleScan}
              disabled={loading || !selectedLecture}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Recording...' : 'Record Attendance'}
            </button>

            {/* Demo Cards */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Demo Cards:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'NFC001234567890',
                  'NFC001234567891',
                  'NFC001234567892',
                  'NFC001234567893',
                ].map((uid) => (
                  <button
                    key={uid}
                    onClick={() => quickScan(uid)}
                    className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {uid.slice(-4)}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendees List */}
      {selectedLecture && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Attendees ({attendees.length})
            </h3>
          </div>

          <div className="space-y-3">
            {attendees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No attendance recorded yet
              </p>
            ) : (
              attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {attendee.student.first_name}{' '}
                        {attendee.student.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {attendee.student.student_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(attendee.scanned_at)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        attendee.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : attendee.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {attendee.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
