import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          student_id: string;
          first_name: string;
          last_name: string;
          faculty: string;
          department: string;
          photo_url: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          first_name: string;
          last_name: string;
          faculty: string;
          department: string;
          photo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          first_name?: string;
          last_name?: string;
          faculty?: string;
          department?: string;
          photo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          card_uid: string;
          student_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_uid: string;
          student_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          card_uid?: string;
          student_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          staff_id: string;
          name: string;
          role: 'admin' | 'teacher' | 'security' | 'doctor' | 'assistant';
          email: string;
          phone: string | null;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          name: string;
          role: 'admin' | 'teacher' | 'security' | 'doctor' | 'assistant';
          email: string;
          phone?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          name?: string;
          role?: 'admin' | 'teacher' | 'security' | 'doctor' | 'assistant';
          email?: string;
          phone?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          course_code: string;
          title: string;
          faculty: string;
          department: string;
          credits: number;
          semester: string | null;
          year: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      lectures: {
        Row: {
          id: string;
          course_id: string;
          staff_id: string;
          gateway_id: string;
          title: string;
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'active' | 'completed' | 'cancelled';
          max_attendance: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      gateways: {
        Row: {
          id: string;
          code: string;
          display_name: string;
          location: string;
          gateway_type: 'gate' | 'classroom';
          capacity: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      devices: {
        Row: {
          id: string;
          device_code: string;
          device_name: string;
          owner: string | null;
          device_type: 'mobile' | 'scanner' | 'tablet';
          is_active: boolean;
          last_seen: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          card_id: string;
          lecture_id: string | null;
          gateway_id: string;
          device_id: string;
          scanned_at: string;
          status: 'present' | 'late' | 'excused';
          note: string | null;
          created_at: string;
        };
      };
    };
  };
};