# PostgreSQL Migration Guide
## From SQLite to PostgreSQL for Vercel Deployment

**Current Status:** ❌ Using SQLite (won't work on Vercel)  
**Target:** ✅ PostgreSQL (required for Vercel)

---

## 📋 CURRENT DATABASE SETUP - FINDINGS

### 1. Prisma Schema Configuration
**File:** `prisma/schema.prisma`
- **Current Provider:** `sqlite` (Line 9)
- **Current DATABASE_URL Format:** `file:./dev.db` (SQLite file path)
- **Status:** ❌ NOT compatible with Vercel serverless

### 2. Environment Variables
**Files Checked:**
- ❌ No `.env` file found (gitignored - correct)
- ✅ `.gitignore` properly excludes `.env*` files
- 📝 Documentation references:
  - `README.md:27` - `DATABASE_URL="file:./dev.db"`
  - `SETUP.md:16` - `DATABASE_URL="file:./dev.db"`

**Current Format:** `file:./dev.db` (SQLite)  
**Required Format:** PostgreSQL connection string

### 3. SQLite-Specific Code Found

#### Files with SQLite References:

1. **`prisma/schema.prisma:9`**
   ```prisma
   provider = "sqlite"  // ❌ MUST CHANGE
   ```

2. **`app/api/submissions/route.ts:94`**
   ```typescript
   // Store collections as JSON string (SQLite requires String, not Json type)
   ```
   - **Note:** Comment mentions SQLite limitation, but code works with PostgreSQL too
   - **Action:** Update comment (optional)

3. **`prisma/dev.db`**
   - **Status:** SQLite database file exists
   - **Action:** Can be deleted after migration (not needed for PostgreSQL)

4. **`.gitignore:39-40`**
   ```gitignore
   /prisma/*.db
   /prisma/*.db-journal
   ```
   - **Status:** ✅ Good - these are SQLite-specific
   - **Action:** Keep (no change needed)

5. **Documentation Files:**
   - `README.md:27` - References SQLite
   - `SETUP.md:16,81` - References SQLite
   - **Action:** Update documentation (optional but recommended)

### 4. Prisma Client Usage
**File:** `lib/prisma.ts`
- ✅ **GOOD:** Uses singleton pattern (works with PostgreSQL)
- ✅ **GOOD:** No database-specific code
- ✅ **COMPATIBLE:** No changes needed

---

## 🔧 EXACT EDITS REQUIRED

### Edit 1: Update Prisma Schema (CRITICAL)

**File:** `prisma/schema.prisma`

**Current:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Change to:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Line to change:** Line 9

---

### Edit 2: Update Comment in API Route (OPTIONAL)

**File:** `app/api/submissions/route.ts`

**Current (Line 94):**
```typescript
// Store collections as JSON string (SQLite requires String, not Json type)
```

**Change to:**
```typescript
// Store collections as JSON string (database stores as String type)
```

**Note:** This is optional - code works the same with PostgreSQL.

---

### Edit 3: Update Documentation (OPTIONAL)

**Files to update:**
1. `README.md` - Update DATABASE_URL example
2. `SETUP.md` - Update database setup instructions

**Current in README.md:**
```bash
DATABASE_URL="file:./dev.db"
```

**Change to:**
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

---

## 📝 MIGRATION STEPS

### Step 1: Set Up PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. Go to Vercel Dashboard → Your Project
2. Navigate to Storage → Create Database
3. Select "Postgres"
4. Copy the connection string from environment variables

**Option B: External PostgreSQL**
- Use services like:
  - Supabase (free tier available)
  - Railway (free tier available)
  - Neon (free tier available)
  - AWS RDS
  - Google Cloud SQL

### Step 2: Update Prisma Schema

Apply **Edit 1** above (change `sqlite` → `postgresql`)

### Step 3: Update Environment Variables

**Local Development:**
1. Create `.env` file (if not exists)
2. Update `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/fuar1?schema=public"
   ```

**Vercel Production:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add/Update `DATABASE_URL` with your PostgreSQL connection string
3. Format: `postgresql://user:password@host:5432/database?sslmode=require`

### Step 4: Create Initial Migration

**Option A: Fresh Start (No existing data to preserve)**
```bash
# Generate Prisma Client for PostgreSQL
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init_postgresql

# This will:
# 1. Create migration files in prisma/migrations/
# 2. Apply migration to database
# 3. Generate Prisma Client
```

**Option B: Preserve Existing Data (if migrating local SQLite data)**
```bash
# 1. Export SQLite data (if needed)
# 2. Create migration
npx prisma migrate dev --name init_postgresql
# 3. Import data to PostgreSQL (manual process)
```

### Step 5: Update Prisma Client

```bash
npx prisma generate
```

### Step 6: Verify Connection

```bash
# Test database connection
npx prisma db pull

# Or open Prisma Studio
npx prisma studio
```

### Step 7: Deploy to Vercel

**Before Deploy:**
1. ✅ Ensure `prisma/schema.prisma` has `provider = "postgresql"`
2. ✅ Set `DATABASE_URL` in Vercel environment variables
3. ✅ Commit changes to git

**Vercel Build Process:**
Vercel will automatically:
1. Run `prisma generate` (via postinstall hook)
2. Run `prisma migrate deploy` (if you add it to `package.json` scripts)

**Optional: Add Migration Script to package.json**
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

---

## 🔍 VERIFICATION CHECKLIST

After migration, verify:

- [ ] `prisma/schema.prisma` has `provider = "postgresql"`
- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] `npx prisma generate` runs without errors
- [ ] `npx prisma migrate deploy` runs without errors
- [ ] Database connection works (test locally first)
- [ ] Application can read/write to database
- [ ] Admin login works
- [ ] Form submissions are saved
- [ ] Admin panel can view submissions

---

## ⚠️ IMPORTANT NOTES

### Data Migration

**If you have existing data in SQLite:**
- SQLite → PostgreSQL migration requires manual data export/import
- Prisma Migrate won't migrate data automatically
- Options:
  1. Export SQLite data to CSV/JSON
  2. Write migration script to import to PostgreSQL
  3. Or start fresh (if test data only)

### Schema Compatibility

**Good News:** Your current schema is fully compatible with PostgreSQL:
- ✅ No SQLite-specific features used
- ✅ `String` type works with PostgreSQL
- ✅ `DateTime` works with PostgreSQL
- ✅ `@default(cuid())` works with PostgreSQL
- ✅ `@updatedAt` works with PostgreSQL
- ✅ Nullable fields (`String?`) work with PostgreSQL

**No schema changes needed** - just change the provider!

### Connection String Formats

**PostgreSQL Connection String:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Example (Vercel Postgres):**
```
postgres://default:password@host.vercel-storage.com:5432/verceldb?sslmode=require
```

**Example (Supabase):**
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

---

## 🚨 ROLLBACK PLAN

If migration fails, you can rollback:

1. Revert `prisma/schema.prisma` (change back to `sqlite`)
2. Restore original `DATABASE_URL` in `.env`
3. Run `npx prisma generate`
4. Keep using SQLite for local development

**Note:** SQLite still works locally, just not on Vercel.

---

## 📊 MIGRATION SUMMARY

### Files That Need Changes:
1. ✅ `prisma/schema.prisma` - **REQUIRED** (1 line change)
2. ⚠️ `app/api/submissions/route.ts` - Optional (comment only)
3. ⚠️ `README.md` - Optional (documentation)
4. ⚠️ `SETUP.md` - Optional (documentation)

### Files That DON'T Need Changes:
- ✅ `lib/prisma.ts` - Works as-is
- ✅ All API routes - No database-specific code
- ✅ All components - No database dependencies
- ✅ `.gitignore` - Already correct

### Estimated Time:
- **Quick Migration (fresh start):** 15-30 minutes
- **Data Migration:** 1-2 hours (if preserving data)

---

## ✅ POST-MIGRATION CHECKLIST

After completing migration:

- [ ] Local development works with PostgreSQL
- [ ] Build passes: `npm run build`
- [ ] Database operations work (CRUD)
- [ ] Admin authentication works
- [ ] Form submissions work
- [ ] PDF exports work
- [ ] Deployed to Vercel successfully
- [ ] Production database connected
- [ ] All features tested in production

---

**Last Updated:** Migration Guide v1.0  
**Status:** Ready for migration
