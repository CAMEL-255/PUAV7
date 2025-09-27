import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  Smartphone, 
  BarChart3,
  Plus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  X,
  Save
} from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalStaff: number;
  totalCourses: number;
  totalLectures: number;
  todayAttendance: number;
}

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  faculty: string;
  department: string;
  email: string;
}

interface Course {
  id: string;
  course_code: string;
  title: string;
  faculty: string;
  department: string;
  credits: number;
  semester: string | null;
  year: string | null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'staff' | 'courses' | 'lectures' | 'reports'>('overview');
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalStaff: 0,
    totalCourses: 0,
    totalLectures: 0,
    todayAttendance: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    title: '',
    faculty: '',
    department: '',
    credits: 3,
    semester: '',
    year: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStats();
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'courses') {
      fetchCourses();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [studentsRes, staffRes, coursesRes, lecturesRes, attendanceRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('lectures').select('id', { count: 'exact', head: true }),
        supabase.from('attendance').select('id', { count: 'exact', head: true })
          .gte('scanned_at', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalStaff: staffRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalLectures: lecturesRes.count || 0,
        todayAttendance: attendanceRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = () => {
    setCourseForm({
      course_code: '',
      title: '',
      faculty: '',
      department: '',
      credits: 3,
      semester: '',
      year: '',
    });
    setEditingCourse(null);
    setShowCourseModal(true);
    setError('');
    setSuccess('');
  };

  const handleEditCourse = (course: Course) => {
    setCourseForm({
      course_code: course.course_code,
      title: course.title,
      faculty: course.faculty,
      department: course.department,
      credits: course.credits,
      semester: course.semester || '',
      year: course.year || '',
    });
    setEditingCourse(course);
    setShowCourseModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveCourse = async () => {
    setError('');
    setSuccess('');

    if (!courseForm.course_code || !courseForm.title || !courseForm.faculty || !courseForm.department) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const courseData = {
        course_code: courseForm.course_code,
        title: courseForm.title,
        faculty: courseForm.faculty,
        department: courseForm.department,
        credits: courseForm.credits,
        semester: courseForm.semester || null,
        year: courseForm.year || null,
      };

      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        setSuccess('Course updated successfully');
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);

        if (error) throw error;
        setSuccess('Course created successfully');
      }

      await fetchCourses();
      await fetchStats();
      
      setTimeout(() => {
        setShowCourseModal(false);
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete "${course.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);

      if (error) throw error;
      
      await fetchCourses();
      await fetchStats();
      setSuccess('Course deleted successfully');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to delete course');
      setTimeout(() => setError(''), 3000);
    }
  };

  const faculties = [
    'Engineering',
    'Business',
    'Medicine',
    'Arts & Sciences',
    'Law',
    'Education',
  ];

  const departmentsByFaculty: Record<string, string[]> = {
    'Engineering': ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'],
    'Business': ['Management', 'Finance', 'Marketing', 'Accounting'],
    'Medicine': ['General Medicine', 'Nursing', 'Pharmacy', 'Dentistry'],
    'Arts & Sciences': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'],
    'Law': ['Criminal Law', 'Corporate Law', 'International Law'],
    'Education': ['Elementary Education', 'Secondary Education', 'Special Education'],
  };
  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = courses.filter(course =>
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'staff', label: 'Staff', icon: GraduationCap },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'lectures', label: 'Lectures', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
    { title: 'Staff Members', value: stats.totalStaff, icon: GraduationCap, color: 'green' },
    { title: 'Active Courses', value: stats.totalCourses, icon: BookOpen, color: 'purple' },
    { title: 'Total Lectures', value: stats.totalLectures, icon: MapPin, color: 'orange' },
    { title: 'Today\'s Attendance', value: stats.todayAttendance, icon: BarChart3, color: 'indigo' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage the university attendance system</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`h-12 w-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('students')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Manage Students</span>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Manage Courses</span>
              </button>
              <button
                onClick={() => setActiveTab('lectures')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <MapPin className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Schedule Lectures</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Upload className="h-4 w-4" />
                Import CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add Student
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Faculty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{student.student_id}</td>
                    <td className="py-3 px-4">{student.first_name} {student.last_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.faculty}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.department}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              onClick={handleAddCourse}
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{course.course_code}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {course.credits} Credits
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">{course.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{course.faculty} - {course.department}</p>
                <div className="flex gap-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    onClick={() => handleEditCourse(course)}
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                    onClick={() => handleEditCourse(course)}
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    onClick={() => handleDeleteCourse(course)}
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No courses found</p>
            </div>
          )}
        </div>
      )}

      {/* Other tabs can be implemented similarly */}
      {(activeTab === 'staff' || activeTab === 'lectures' || activeTab === 'reports') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h2>
            <p className="text-gray-500">This section is under development</p>
          </div>
        </div>
      )}
    </div>
  );
}