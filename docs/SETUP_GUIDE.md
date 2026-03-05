# 🚀 Database Setup Instructions

Since you've created a new Supabase project, follow these steps to set up your database:

## Quick Setup (3 Steps)

### Step 1: Run SQL Migrations in Supabase Dashboard

1. **Open your Supabase Dashboard:**
   ```
   https://nljwzmdeznmreaoffgxj.supabase.co
   ```

2. **Navigate to SQL Editor:**
   - Click **SQL Editor** in the left sidebar
   - Click the **New Query** button

3. **Copy and Run the Migration:**
   - Open the file: `setup_database.sql` (in your project root)
   - Copy **all** the contents
   - Paste into the SQL editor
   - Click **Run** (or press `Ctrl + Enter`)
   - Wait for the success message (this may take 10-20 seconds)

### Step 2: Seed the Database

Run this command in your terminal:

```bash
npm run seed
```

This will populate your database with:
- ✅ Courses from `src/lib/data/courses.json`
- ✅ Professors from `src/lib/data/professors.json`

### Step 3: Restart Dev Server

```bash
npm run dev
```

## Verify Everything Works

1. **Check Supabase Dashboard:**
   - Go to **Table Editor**
   - You should see these tables:
     - `users`
     - `courses`
     - `professors`
     - `professors_courses`
     - `reviews`
     - `votes`
     - `flags`
     - `review_sentiments`

2. **Check Your Website:**
   - Open a course page
   - You should now see:
     - ✅ **AI-Generated Course Summary** section
     - ✅ **Key Themes** in the sidebar
     - ✅ **Rate This Course** button in the sidebar

## Troubleshooting

### Issue: SQL migration fails

**Error:** `relation "auth.users" does not exist`

**Solution:** Make sure you're running the SQL in your Supabase project's SQL Editor, not locally.

---

### Issue: `npm run seed` fails

**Error:** `Failed to fetch user information`

**Solution:** 
1. Verify your `.env` file has:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Make sure the migrations were run successfully first

---

### Issue: Features still not visible

**Solution:**
1. Check browser console for errors (F12)
2. Make sure courses exist in the database:
   ```sql
   SELECT COUNT(*) FROM courses;
   ```
3. Clear browser cache and hard refresh (Ctrl + Shift + R)

---

## Alternative: Manual Setup via Supabase Dashboard

If you prefer to do it manually:

1. **Run Main Migration:**
   - Copy contents of `src/migrations/migration.sql`
   - Paste and run in SQL Editor

2. **Run Sentiment Migration:**
   - Copy contents of `src/migrations/sentiment_analysis.sql`
   - Paste and run in SQL Editor

3. **Seed Data:**
   - Run `npm run seed`

## What Gets Created

### Tables (8 total)
- **users** - Anonymous user tracking
- **courses** - Course information
- **professors** - Professor information
- **professors_courses** - Many-to-many relationship
- **reviews** - Course and professor reviews
- **votes** - Helpful/unhelpful votes on reviews
- **flags** - Flagged reviews for moderation
- **review_sentiments** - AI sentiment analysis results

### Functions (10+ total)
- Update rating aggregates automatically
- Handle user authentication
- Sanitize PII from comments
- Calculate sentiment trends
- And more...

### Views (3 total)
- `recent_sentiments`
- `course_sentiment_summary`
- `professor_sentiment_summary`

---

## Need More Help?

If you're still having issues:
1. Check the terminal output when running `npm run seed`
2. Look for errors in the browser console
3. Verify your Supabase project is active and accessible
