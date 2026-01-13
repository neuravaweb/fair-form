# Fabric Fair Website

A premium, luxury B2B website for a company attending a fabric fair. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Luxury Design**: Deep matte black background with metallic gold accents
- **Customer Registration**: Form with 144 selectable cardboard samples
- **Form Validation**: Real-time validation including NIP (exactly 10 digits)
- **Admin Dashboard**: Secure admin panel to view all submissions
- **PDF Export**: Export single or all submissions as professional PDFs
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
ADMIN_EMAIL="admin@fabricfair.com"
ADMIN_PASSWORD="admin123"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create admin user
npx ts-node scripts/init-admin.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

- **Login URL**: `/admin/login` or `http://localhost:3000/admin/login`
- **Dashboard URL**: `/admin` or `http://localhost:3000/admin` (requires login)
- **Default Username**: `admin` (or as set in `.env` as `ADMIN_EMAIL`)
- **Default Password**: `admin123` (or as set in `.env` as `ADMIN_PASSWORD`)

**Important**: Change the admin credentials in production!

## Project Structure

```
├── app/
│   ├── admin/              # Admin pages
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
├── lib/                    # Utilities
├── prisma/                 # Database schema
└── scripts/                # Setup scripts
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **SQLite** - Database (can be migrated to PostgreSQL)
- **jsPDF** - PDF generation
- **Zod** - Schema validation

## Production Deployment

1. Change all environment variables
2. Use a production database (PostgreSQL recommended)
3. Update `NEXTAUTH_SECRET` with a secure random string
4. Change admin credentials
5. Build and deploy:

```bash
npm run build
npm start
```

## License

Private - For Fabric Fair use only
