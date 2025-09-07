# SIPAS-NG - Sistem Informasi Pengarsipan Sekolah

SIPAS-NG (Sistem Informasi Pengarsipan Sekolah - Next Generation) is a comprehensive school archiving information system built with modern web technologies. This monorepo contains both the backend API and frontend application for managing school documents, correspondence, and administrative workflows.

## Features

- **Document Management**: Comprehensive archiving system for incoming and outgoing school correspondence
- **Disposition System**: Workflow management for document routing and approvals within school administration
- **Reporting**: Generate Excel reports for mail, school activities, and meeting minutes
- **User Management**: Role-based access control with school position hierarchy
- **Reference Data**: Manage document types, classifications, and school organizational structure
- **Activity Tracking**: Record and manage school activities with file attachments
- **Meeting Minutes**: Digital notulen with audio recording support for school meetings
- **File Upload**: Secure file handling for documents, images, and audio files
- **Complete Database Seeding**: Realistic mock data for all modules and reference tables

## Technology Stack

### Backend (`backend-laravel/`)
- **Laravel 12** - PHP web application framework
- **PHP 8.2+** - Server-side scripting language
- **Laravel Sanctum** - API authentication
- **Maatwebsite Excel** - Excel export functionality
- **MySQL/MariaDB** - Database management system

### Frontend (`frontend-next/`)
- **Next.js 15** - React framework with App Router
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Recharts** - Chart library for data visualization

## Requirements

- **PHP 8.2+** and Composer
- **Node.js 18+** and npm/pnpm/yarn
- **MySQL/MariaDB** (XAMPP recommended for Windows)
- **Git** for version control

## Project Structure

```text
sipas-ng/
├── backend-laravel/          # Laravel API backend
│   ├── app/                  # Application logic
│   │   ├── Http/Controllers/ # API controllers
│   │   ├── Models/           # Eloquent models
│   │   └── Exports/          # Excel export classes
│   ├── config/               # Configuration files
│   ├── database/             # Migrations and seeders
│   │   └── seeders/          # 20 comprehensive seeders
│   ├── API_DOCUMENTATION.md  # Complete API documentation
│   ├── API_ENDPOINTS.md      # Quick API reference
│   └── README.md             # Laravel-specific readme
├── frontend-next/            # Next.js frontend application
│   ├── app/                  # App Router pages
│   │   ├── dashboard/        # Dashboard module
│   │   ├── arsip/            # Archive management
│   │   ├── surat-masuk/      # Incoming mail
│   │   ├── surat-keluar/     # Outgoing mail
│   │   ├── disposisi/        # Disposition workflow
│   │   ├── laporan/          # Reports
│   │   ├── referensi/        # Reference data
│   │   └── user/             # User management
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utility functions and API clients
│   └── hooks/                # Custom React hooks
└── README.md                 # This file
```

## Setup Instructions

### Backend Setup (`backend-laravel/`)

1. **Environment Configuration**
   ```bash
   cd backend-laravel
   cp .env.example .env
   ```
   Update database credentials and other settings in `.env`

2. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Application Setup**
   ```bash
   php artisan key:generate
   php artisan migrate:fresh --seed
   ```
   
   **Note**: The `--seed` flag will populate your database with comprehensive realistic data including:
   - 15 school staff users with proper roles
   - 50+ school positions and organizational structure
   - Multiple document types and classifications
   - Sample incoming/outgoing mail
   - Meeting minutes and activity records
   - Reference data for all modules

4. **Start Development Servers**
   ```bash
   # Option 1: Use the convenient dev script (runs all services)
   composer run dev
   
   # Option 2: Run services individually
   php artisan serve          # API server at http://127.0.0.1:8000
   php artisan queue:listen   # Background job processing
   npm run dev                # Vite development server
   ```

### Frontend Setup (`frontend-next/`)

1. **Install Dependencies**
   ```bash
   cd frontend-next
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev                # Frontend at http://localhost:3000
   ```

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Database Seeding

The system includes **20 comprehensive seeders** that populate all tables with realistic school data:

### Reference Data Seeders (6)
- `RefJenisNaskahSeeder` - Document type references (SK, SE, ST, etc.)
- `RefKlasifikasiSeeder` - Classification references (Academic, Finance, HR, etc.)
- `RefDisposisiSeeder` - Disposition instruction templates
- `RefPenandatangananSeeder` - Authorized school signatories
- `RefTujuanSeeder` - Destination categories for correspondence
- `RefJabatanSeeder` - Position references with hierarchy levels

### Core Data Seeders (8)
- `KlasifikasiSeeder` - Document classifications
- `JenisNaskahSeeder` - Document types
- `JabatanSeeder` - School positions (50+ roles)
- `UserSeeder` - School staff (15 users with realistic data)
- `SuratMasukSeeder` - Incoming mail samples
- `SuratKeluarSeeder` - Outgoing mail samples
- `DisposisiSeeder` - Disposition workflow examples
- `KegiatanSeeder` - School activities and events

### Extended Data Seeders (6)
- `NotulenSeeder` - Meeting minutes records
- `SuratRekapSeeder` - Monthly letter summaries
- `LembarPantauSeeder` - Document monitoring sheets
- `TembusanSeeder` - Carbon copy data
- `TujuanSeeder` - Recipient data
- `DatabaseSeeder` - Orchestrates all seeders in correct order

### Running Seeders
```bash
# Fresh migration with all seeders
php artisan migrate:fresh --seed

# Run specific seeder
php artisan db:seed --class=UserSeeder

# Refresh only seeders (keep existing data structure)
php artisan db:seed --force
```

## API Documentation

Complete API documentation is available in multiple formats:

- **[`backend-laravel/API_DOCUMENTATION.md`](backend-laravel/API_DOCUMENTATION.md)** - Comprehensive API guide with examples
- **[`backend-laravel/API_ENDPOINTS.md`](backend-laravel/API_ENDPOINTS.md)** - Quick reference for all endpoints

The API provides endpoints for:
- Authentication (login/logout)
- Document management (incoming/outgoing mail)
- Archive search and filtering
- Disposition workflow
- User and reference data management
- File uploads and exports
- Reporting functionality

## Development Guidelines

- **Branching**: Use feature branches and pull requests
- **API Contract**: Keep API endpoints documented in `API_DOCUMENTATION.md`
- **Database Changes**: Use Laravel migrations and update seeders accordingly
- **Code Style**: Follow Laravel and Next.js best practices
- **Testing**: Write tests for new features and bug fixes
- **Seeding**: Update relevant seeders when adding new data structures

## Key Modules

### Document Management
- **Surat Masuk**: Incoming mail processing and tracking
- **Surat Keluar**: Outgoing mail creation and management
- **Arsip**: Unified archive search across all documents

### Workflow Management
- **Disposisi**: Document routing and approval workflows
- **Lembar Pantau**: Document monitoring and tracking

### Administration
- **User Management**: User accounts and role assignments
- **Reference Data**: Document types, classifications, positions
- **Reporting**: Excel exports for various data types

### Additional Features
- **Kegiatan**: Activity and event management
- **Notulen**: Meeting minutes with audio support
- **Dashboard**: Overview and analytics
- **Rekap Surat**: Monthly correspondence summaries

## Default Login Credentials

After seeding, you can login with these test accounts:

**Admin Account:**
- Email: `admin@sipas.sch.id`
- Password: `password`

**Sample Staff Accounts:**
- Email: `kepala.sekolah@sipas.sch.id` (Kepala Sekolah)
- Email: `wakil.kurikulum@sipas.sch.id` (Wakil Kepala Kurikulum)
- Email: `guru.matematika@sipas.sch.id` (Guru Matematika)
- Password for all: `password`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.