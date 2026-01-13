# Quick Setup Guide

Follow these steps to get the website running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Environment File

Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-random-string-in-production"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

**Important**: 
- Change `NEXTAUTH_SECRET` to a random string (you can generate one with: `openssl rand -base64 32`)
- Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` to your preferred admin credentials

## Step 3: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Create database and tables
npm run db:push

# Create admin user
npm run init:admin
```

## Step 4: Start Development Server

```bash
npm run dev
```

The website will be available at: **http://localhost:3000**

## Step 5: Access Admin Panel

1. Navigate to: **http://localhost:3000/admin/login**
2. Login with the credentials you set in `.env`

## Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Reset the database
rm prisma/dev.db
npm run db:push
npm run init:admin
```

### Port Already in Use
If port 3000 is already in use:
```bash
# Use a different port
PORT=3001 npm run dev
```

### TypeScript Errors
If you see TypeScript errors:
```bash
# Regenerate Prisma client
npm run db:generate
```

## Production Deployment

1. Update all environment variables with production values
2. Use PostgreSQL instead of SQLite (update `DATABASE_URL` in `.env`)
3. Run migrations: `npm run db:push`
4. Build: `npm run build`
5. Start: `npm start`
