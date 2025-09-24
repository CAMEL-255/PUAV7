import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface StaffUser {
  id: string;
  staff_id: string;
  name: string;
  role: 'admin' | 'teacher' | 'security' | 'doctor' | 'assistant';
  email: string;
  phone: string | null;
  department: string | null;
}

export interface StudentUser {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  faculty: string;
  department: string;
  email: string;
  phone: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'staff' | 'student' | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserInfo(session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserInfo(session.user.email!);
      } else {
        setStaff(null);
        setStudent(null);
        setUserType(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserInfo = async (email: string) => {
    try {
      console.log('Fetching user info for email:', email);
      
      // First try to find staff record
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('Staff query result:', { data, error });

      if (error) {
        console.error('Error fetching staff info:', error);
        setStaff(null);
        setUserType(null);
      } else if (data) {
        console.log('Staff found:', data);
        setStaff(data);
        setUserType('staff');
        setStudent(null);
      } else {
        console.log('No staff record found, checking for student record...');
        
        // Try to find student record
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        console.log('Student query result:', { data: studentData, error: studentError });

        if (studentError) {
          console.error('Error fetching student info:', studentError);
          setStudent(null);
          setUserType(null);
        } else if (studentData) {
          console.log('Student found:', studentData);
          setStudent(studentData);
          setUserType('student');
          setStaff(null);
        } else {
          console.log('No user record found for email:', email);
          setUserType(null);
        }
        setStaff(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setStaff(null);
      setStudent(null);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin, // Redirect to app base URL
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setStaff(null);
      setStudent(null);
      setUserType(null);
    }
    return { error };
  };

  return {
    user,
    staff,
    student,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
  };
}