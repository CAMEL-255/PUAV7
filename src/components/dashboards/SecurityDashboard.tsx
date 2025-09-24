import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Scan, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  faculty: string;
  department: string;
  photo_url: string | null;
}

interface RecentEntry {
  id: string;
  scanned_at: string;
  student: Student;
  status: string;
}

export default function SecurityDashboard() {
  const [cardUid, setCardUid] = useState('');
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchRecentEntries();
    if ('NDEFReader' in window) {
      setIsNfcSupported(true);
    }
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select(
          `
          *,
          students:student_id (*)
        `
        )
        .is('lecture_id', null)
        .gte('scanned_at', `${today}T00:00:00`)
        .order('scanned_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentEntries(
        data.map((entry) => ({
          ...entry,
          student: entry.students as Student,
        }))
      );
    } catch (error) {
      console.error('Error fetching recent entries:', error);
    }
  };

  const recordAttendance = async (uid: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setScannedStudent(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          card_uid: uid,
          device_code: 'DEV001',
          gateway_code: 'MAIN_GATE',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'student_not_found') {
          throw new Error('Student not found. Please ensure the card UID matches a registered student ID.');
        } else if (result.error === 'gateway_or_device_not_found') {
          throw new Error('Gateway or device not configured properly.');
        } else {
          throw new Error(result.error || 'Scan failed');
        }
      }

      setScannedStudent(result.student);
      const message = result.card_created 
        ? `New card registered and entry recorded for ${result.student.first_name} ${result.student.last_name}`
        : `Entry recorded for ${result.student.first_name} ${result.student.last_name}`;
      setSuccess(message);
      setCardUid('');
      await fetchRecentEntries();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = () => {
    recordAttendance(cardUid);
  };

  const quickScan = (uid: string) => {
    setCardUid(uid);
    recordAttendance(uid);
  };

  const startNfcScan = async () => {
    if (!isNfcSupported) {
      setError('Web NFC is not supported on this browser or device.');
      return;
    }

    setIsScanning(true);
    setLoading(true);
    setCardUid('');
    setError('');
    setSuccess('');

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setSuccess('NFC scanning started. Tap a card to the back of your phone.');

      ndef.onreading = (event: { message: { records: any } }) => {
        setLoading(false);
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          if (record.recordType === 'text') {
            const uid = decoder.decode(record.data);
            console.log('NFC Scanned UID:', uid);
            setCardUid(uid);
            recordAttendance(uid);
            ndef.onreading = null;
            return;
          }
        }
      };

      ndef.onreadingerror = () => {
        setError('Cannot read data from the NFC tag. Try another one?');
      };
    } catch (error) {
      setError(`NFC scan failed: ${error.message}`);
      setIsScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Scan className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Campus Gate Scanner
          </h2>
          <p className="text-gray-600">
            Scan student NFC cards for campus entry
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          {isNfcSupported && (
            <button
              onClick={startNfcScan}
              disabled={isScanning || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? 'Scanning...' : 'Start NFC Scanner'}
            </button>
          )}

          {!isNfcSupported && (
            <div>
              <label
                htmlFor="cardUid"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Card UID
              </label>
              <input
                id="cardUid"
                type="text"
                placeholder="Enter NFC card UID manually"
                value={cardUid}
                onChange={(e) => setCardUid(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              />
            </div>
          )}

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

      {scannedStudent && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Student Profile
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              {scannedStudent.photo_url ? (
                <img
                  src={scannedStudent.photo_url}
                  alt={`${scannedStudent.first_name} ${scannedStudent.last_name}`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900">
                {scannedStudent.first_name} {scannedStudent.last_name}
              </h4>
              <p className="text-gray-600">ID: {scannedStudent.student_id}</p>
              <p className="text-sm text-gray-500">
                {scannedStudent.faculty} - {scannedStudent.department}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Entries
          </h3>
        </div>

        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No entries today</p>
          ) : (
            recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.student.first_name} {entry.student.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.student.student_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatTime(entry.scanned_at)}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      entry.status === 'present'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
