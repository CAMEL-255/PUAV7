# University NFC Attendance Management System

A comprehensive web application for managing university attendance using NFC student cards with role-based dashboards for Security, Teachers, and Administrators.

## 🎯 Features

### Security Dashboard
- **NFC Card Scanning**: Scan student cards at campus gates
- **Student Verification**: Instant student profile display with photo
- **Entry Logging**: Automatic campus entry attendance recording
- **Recent Entries**: Real-time list of today's gate entries

### Teacher Dashboard
- **Lecture Management**: Select and manage active lectures
- **NFC Attendance**: Scan student cards for lecture attendance
- **Duplicate Prevention**: Automatic blocking of duplicate attendance
- **Live Attendee List**: Real-time display of lecture attendees

### Admin Dashboard
- **Complete CRUD Operations**: Manage students, staff, courses, lectures
- **Analytics Dashboard**: Comprehensive statistics and insights
- **CSV Import/Export**: Bulk student data management
- **Photo Storage**: Student profile picture management
- **Attendance Reports**: Detailed reporting with filtering options

## 🏗 Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Lucide React** for icons
- **Vite** for fast development

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates

### Database Schema
- `students` - Student information and profiles
- `cards` - NFC card UIDs linked to students
- `staff` - Teachers, security, and admin users
- `courses` - Course catalog
- `lectures` - Individual lecture sessions
- `gateways` - Campus gates and classrooms
- `devices` - NFC scanning devices
- `attendance` - All attendance records

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd university-attendance-system
npm install
```

### 2. Setup Supabase
1. Create a new Supabase project
2. Click "Connect to Supabase" in the top right of the application
3. Run the database migrations in the Supabase SQL editor:
   - Execute `supabase/migrations/create_attendance_schema.sql`
   - Execute `supabase/migrations/seed_sample_data.sql`

### 3. Configure Environment
```bash
cp .env.example .env
# Add your Supabase URL and keys to .env
```

### 4. Start Development
```bash
npm run dev
```

## 👥 Demo Accounts

The system comes with pre-configured demo accounts:

- **Admin**: admin@university.edu (password: password123)
- **Teacher**: teacher@university.edu (password: password123)
- **Security**: security@university.edu (password: password123)

## 📱 NFC Simulation

The system includes demo NFC card UIDs for testing:
- `NFC001234567890` - Alice Johnson
- `NFC001234567891` - Bob Smith
- `NFC001234567892` - Carol Davis
- `NFC001234567893` - David Wilson

## 🔐 Security Features

- **Role-based Authentication** using Supabase Auth
- **Row Level Security (RLS)** policies on all tables
- **Data validation** and sanitization
- **Secure API endpoints** with proper error handling

## 📊 API Endpoints

### POST /api/scan
Handles NFC card scanning for both gate entry and lecture attendance.

**Request:**
```json
{
  "card_uid": "NFC001234567890",
  "device_code": "DEV001",
  "gateway_code": "MAIN_GATE",
  "lecture_id": "optional-lecture-id"
}
```

**Response:**
```json
{
  "ok": true,
  "student": {...},
  "attendance_id": "uuid",
  "status": "present"
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#1e40af) - University branding
- **Secondary**: Green (#059669) - Success and teacher actions  
- **Accent**: Orange (#ea580c) - Security and attention
- **Neutral**: Gray tones for backgrounds and text

### Responsive Design
- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Optimized layouts** for each user role

## 📈 Database Schema

```sql
-- Key relationships
students → cards (1:many)
staff → lectures (1:many)  
courses → lectures (1:many)
lectures → attendance (1:many)
students → attendance (1:many)
gateways → attendance (1:many)
devices → attendance (1:many)
```

## 🔧 Configuration

### Supabase Storage
Configure a `photos` bucket for student profile pictures:
1. Go to Storage in Supabase dashboard
2. Create bucket named `photos`
3. Set appropriate RLS policies for image uploads

### Edge Functions
The NFC scanning API is implemented as a Supabase Edge Function for optimal performance and security.

## 📦 Deployment

### Frontend (Bolt Hosting/Vercel/Netlify)
```bash
npm run build
# Deploy the dist folder
```

### Backend
The backend runs entirely on Supabase:
- Database: Managed PostgreSQL
- Authentication: Supabase Auth
- Storage: Supabase Storage
- API: Supabase Edge Functions

## 🧪 Testing

### Demo Data
The system includes comprehensive seed data:
- 8 sample students with NFC cards
- 3 staff members (admin, teacher, security)
- 5 courses across different faculties
- Sample lectures and attendance records

### API Testing
Use the demo NFC card UIDs to test the scanning functionality across all dashboards.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the GitHub Issues page
- Review the API documentation
- Consult the Supabase documentation for backend questions