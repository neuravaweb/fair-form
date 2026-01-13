# DEPLOYMENT CHECKLIST
## Pre-Deployment Audit Summary

**Status:** ⚠️ **CAN BUILD BUT NOT PRODUCTION READY**

**Build Status:** ✅ BUILD PASSES (Fixed TypeScript errors)

---

## ✅ FIXED ISSUES

1. ✅ **TypeScript Build Error** - Fixed missing translation keys in `locales/en.json`
2. ✅ **Type Definition** - Fixed `SubmissionDetail` interface to allow nullable address fields

---

## ❌ CRITICAL ISSUES (MUST FIX BEFORE DEPLOYMENT)

### 1. Database Provider - SQLite → PostgreSQL
**Status:** ❌ BLOCKING

**Issue:** Using SQLite which doesn't work on Vercel serverless
- **File:** `prisma/schema.prisma:9`
- **Current:** `provider = "sqlite"`
- **Required:** `provider = "postgresql"`

**Action Required:**
1. Set up PostgreSQL database (Vercel Postgres recommended)
2. Update `DATABASE_URL` environment variable
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations: `prisma migrate deploy`
5. Generate Prisma Client: `prisma generate`

---

### 2. setInterval in Server-Side Code
**Status:** ❌ MEMORY LEAK RISK

**Issue:** `setInterval` won't work correctly in serverless environment
- **Files:** 
  - `lib/captchaStore.ts:16-23`
  - `lib/rateLimit.ts:17-27`

**Impact:**
- Memory leaks (intervals persist across invocations)
- Rate limiting won't work correctly
- Captcha cleanup won't work correctly

**Action Required:**
- **Option 1:** Remove `setInterval`, cleanup on-demand
- **Option 2 (Recommended):** Use Vercel KV (Redis) for distributed storage
- **Option 3:** Use Vercel Edge Config for rate limiting

**Quick Fix (Temporary):**
Remove `setInterval` calls and clean up on-demand when accessing stores.

---

### 3. In-Memory Storage (captchaStore & rateLimit)
**Status:** ❌ WON'T WORK ACROSS INSTANCES

**Issue:** In-memory Maps won't persist across serverless instances
- **Files:**
  - `lib/captchaStore.ts`
  - `lib/rateLimit.ts`

**Impact:**
- Rate limiting won't work correctly (each instance has its own store)
- Captcha codes won't persist across instances
- Multiple serverless instances = multiple isolated stores

**Action Required:**
- Use Vercel KV (Redis) or similar distributed storage
- Or accept limitation for MVP (rate limiting per instance)

---

## ⚠️ HIGH PRIORITY ISSUES

### 4. Environment Variables
**Status:** ⚠️ NEEDS CONFIGURATION

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (currently SQLite)

**Recommended:**
- Create `.env.example` file
- Document required variables in README

---

### 5. Console.error Statements
**Status:** ⚠️ SECURITY/RUNTIME CONCERN

**Files with console.error:**
- `app/api/submissions/route.ts:117,159`
- `app/api/auth/login/route.ts:92`
- `app/api/captcha/verify/route.ts:37,65`
- `app/api/admin/export-*.ts:59,231`
- `app/admin/page.tsx:50,76`
- `app/admin/submissions/[id]/page.tsx:70,91,128`

**Action Required:**
- Remove or replace with proper logging service
- Ensure no sensitive data in logs
- Consider using Sentry or Vercel's logging

---

### 6. ESLint Warnings
**Status:** ⚠️ NON-BLOCKING

**Warnings:**
- `app/admin/page.tsx:26` - Missing dependency in useEffect
- `app/admin/submissions/[id]/page.tsx:43` - Missing dependency in useEffect

**Action Required:**
- Fix React Hook dependencies or add eslint-disable comments

---

## ✅ VERIFIED AS GOOD

1. ✅ **Project Structure** - Correct Next.js App Router structure
2. ✅ **Client Components** - All properly marked with "use client"
3. ✅ **Server Components** - Correct usage
4. ✅ **API Routes** - All serverless-compatible
5. ✅ **Admin Authentication** - Protected by middleware
6. ✅ **Vercel Compatibility** - Correct scripts, no custom server
7. ✅ **Prisma Configuration** - Correct singleton pattern (but wrong DB)
8. ✅ **Build Scripts** - Correct `build` and `start` scripts
9. ✅ **Security** - No hardcoded credentials
10. ✅ **TypeScript** - Build passes, strict mode enabled

---

## DEPLOYMENT STEPS

### Before Deployment:

1. **Set up PostgreSQL Database**
   ```bash
   # On Vercel Dashboard:
   # Add Integration → Vercel Postgres
   # Or use external PostgreSQL (Supabase, Railway, etc.)
   ```

2. **Update Prisma Schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Configure Environment Variables on Vercel**
   - `DATABASE_URL` - PostgreSQL connection string

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Fix Serverless Issues (Choose One):**
   
   **Option A: Quick Fix (Remove setInterval)**
   - Remove `setInterval` from `lib/captchaStore.ts` and `lib/rateLimit.ts`
   - Cleanup on-demand instead
   
   **Option B: Proper Fix (Use Vercel KV)**
   - Add Vercel KV integration
   - Replace in-memory stores with KV
   - Update `lib/captchaStore.ts` and `lib/rateLimit.ts`

6. **Deploy to Preview First**
   - Test all functionality
   - Verify database connection
   - Test admin login
   - Test form submissions
   - Test PDF exports

7. **Production Deployment**
   - Only after preview testing passes
   - Monitor logs for errors
   - Verify rate limiting works (if implemented)

---

## MINIMUM VIABLE DEPLOYMENT (If you must deploy now)

If you absolutely must deploy before fixing all issues:

1. ✅ Fix database to PostgreSQL (REQUIRED)
2. ⚠️ Remove `setInterval` calls (Quick fix)
3. ⚠️ Accept that rate limiting won't work perfectly (per-instance)
4. ⚠️ Accept that captcha may fail occasionally (per-instance)
5. ✅ Configure environment variables

**This is NOT recommended** but will allow basic functionality to work.

---

## RECOMMENDED ARCHITECTURE CHANGES

For production-ready deployment:

1. **Database:** PostgreSQL (Vercel Postgres)
2. **Caching/Storage:** Vercel KV for:
   - Captcha codes
   - Rate limiting
3. **Logging:** Sentry or Vercel Logs
4. **Monitoring:** Vercel Analytics + Error Tracking

---

## RISK ASSESSMENT

### High Risk (Will Cause Failures):
- ❌ SQLite database (100% failure rate on Vercel)
- ❌ setInterval in server code (memory leaks)

### Medium Risk (May Cause Issues):
- ⚠️ In-memory storage (inconsistent behavior)
- ⚠️ No error logging service

### Low Risk (Minor Issues):
- ⚠️ ESLint warnings
- ⚠️ Console.error statements

---

## FINAL VERDICT

**Build Status:** ✅ **PASSES**
**Production Ready:** ❌ **NO** - Critical database issue
**Deployable:** ⚠️ **ONLY AFTER FIXING DATABASE**

**Estimated Time to Production Ready:**
- Minimum: 2-4 hours (PostgreSQL setup + quick fixes)
- Recommended: 1-2 days (PostgreSQL + KV + logging)

---

**Last Updated:** $(date)
**Audit Version:** 1.0
