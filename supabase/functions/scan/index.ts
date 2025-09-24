import { createClient } from 'npm:@supabase/supabase-js@2';

interface ScanRequest {
  card_uid: string;
  device_code: string;
  gateway_code: string;
  lecture_id?: string;
}

interface ScanResponse {
  ok: boolean;
  student?: any;
  attendance_id?: string;
  error?: string;
  card_created?: boolean;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body: ScanRequest = await req.json();
    const { card_uid, device_code, gateway_code, lecture_id } = body;

    // Validate required fields
    if (!card_uid || !device_code || !gateway_code) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find gateway and device first
    const [gatewayRes, deviceRes] = await Promise.all([
      supabase.from('gateways').select('id').eq('code', gateway_code).single(),
      supabase.from('devices').select('id').eq('device_code', device_code).single()
    ]);

    if (gatewayRes.error || deviceRes.error) {
      return new Response(
        JSON.stringify({ ok: false, error: "gateway_or_device_not_found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const gateway_id = gatewayRes.data.id;
    const device_id = deviceRes.data.id;

    // Try to find existing card
    let { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        *,
        students (*)
      `)
      .eq('card_uid', card_uid)
      .eq('is_active', true)
      .single();

    let cardCreated = false;
    let student = null;

    if (cardError || !card) {
      // Card doesn't exist, try to find student by student_id (assuming card_uid contains student_id)
      // First, try to extract student_id from card_uid (remove NFC prefix if exists)
      let studentId = card_uid;
      if (card_uid.startsWith('NFC')) {
        // For demo cards like NFC001234567890, we need to map to actual student IDs
        const demoCardMapping: { [key: string]: string } = {
          'NFC001234567890': 'STU001',
          'NFC001234567891': 'STU002', 
          'NFC001234567892': 'STU003',
          'NFC001234567893': 'STU004',
          'NFC001234567894': 'STU005',
          'NFC001234567895': 'STU006',
          'NFC001234567896': 'STU007',
          'NFC001234567897': 'STU008'
        };
        studentId = demoCardMapping[card_uid] || card_uid;
      }

      // Find student by student_id
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (studentError || !studentData) {
        return new Response(
          JSON.stringify({ ok: false, error: "student_not_found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      student = studentData;

      // Create new card record
      const { data: newCard, error: createCardError } = await supabase
        .from('cards')
        .insert([
          {
            card_uid: card_uid,
            student_id: student.id,
            is_active: true,
          }
        ])
        .select(`
          *,
          students (*)
        `)
        .single();

      if (createCardError) {
        console.error('Error creating card:', createCardError);
        return new Response(
          JSON.stringify({ ok: false, error: "card_creation_failed" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      card = newCard;
      cardCreated = true;
    }

    student = card.students;

    // If lecture_id is provided, check for duplicate attendance
    if (lecture_id) {
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', student.id)
        .eq('lecture_id', lecture_id)
        .single();

      if (existingAttendance) {
        return new Response(
          JSON.stringify({ ok: false, error: "already_recorded" }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Determine status based on time (simplified logic)
    let status = 'present';
    if (lecture_id) {
      // For lecture attendance, could check if student is late
      // This is simplified - in real implementation, you'd check lecture start time
      const now = new Date();
      const lectureStartBuffer = 10; // 10 minutes after start = late
      // Implementation would compare with actual lecture start time
      status = 'present'; // Simplified for demo
    }

    // Record attendance
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert([
        {
          student_id: student.id,
          card_id: card.id,
          lecture_id: lecture_id || null,
          gateway_id,
          device_id,
          status,
          scanned_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (attendanceError) {
      console.error('Attendance error:', attendanceError);
      return new Response(
        JSON.stringify({ ok: false, error: "attendance_recording_failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update device last_seen
    await supabase
      .from('devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', device_id);

    return new Response(
      JSON.stringify({
        ok: true,
        student,
        attendance_id: attendance.id,
        status,
        scanned_at: attendance.scanned_at,
        card_created: cardCreated,
      } as ScanResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Scan error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: "internal_server_error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});