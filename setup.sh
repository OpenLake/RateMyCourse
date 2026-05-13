#!/bin/bash

# RateMyCourse Database Setup Script
# This script helps you set up your Supabase database

echo "🚀 RateMyCourse Database Setup"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📍 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Check if setup_database.sql exists
if [ ! -f setup_database.sql ]; then
    echo "⚠️  Combined SQL file not found. Creating it..."
    cat src/migrations/migration.sql src/migrations/sentiment_analysis.sql > setup_database.sql
    echo "✅ Created setup_database.sql"
fi

echo ""
echo "📋 STEP 1: Run Database Migrations"
echo "================================"
echo ""
echo "Please follow these steps in your Supabase Dashboard:"
echo ""
echo "1. Open your Supabase Dashboard:"
echo "   👉 $NEXT_PUBLIC_SUPABASE_URL"
echo ""
echo "2. Navigate to: SQL Editor (left sidebar)"
echo ""
echo "3. Click: 'New Query'"
echo ""
echo "4. Copy the entire contents of this file:"
echo "   📄 setup_database.sql"
echo ""
echo "5. Paste it into the SQL editor and click 'Run'"
echo ""
echo "6. Wait for the success message"
echo ""
echo "Press ENTER when you've completed the above steps..."
read

echo ""
echo "📋 STEP 2: Seed the Database"
echo "================================"
echo ""
echo "Running seed script to populate courses and professors..."
echo ""

npm run seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "📋 STEP 3: Verify Setup"
    echo "================================"
    echo ""
    echo "Go to your Supabase Dashboard and check:"
    echo "  ✓ Table Editor → You should see: users, courses, professors, reviews, etc."
    echo "  ✓ Database → Functions → You should see several functions"
    echo ""
    echo "Then restart your dev server:"
    echo "  npm run dev"
    echo ""
    echo "All features should now be visible on course pages!"
else
    echo ""
    echo "❌ Seeding failed. Please check the error messages above."
    echo ""
    echo "Common issues:"
    echo "  - Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env"
    echo "  - Ensure migrations were run successfully"
    echo "  - Check that courses.json and professors.json exist in src/lib/data/"
fi
