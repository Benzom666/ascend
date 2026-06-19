/**
 * Script to backup and delete old 2023 dates with missing/invalid user_data
 * 
 * This will:
 * 1. Find all dates from 2023 with missing user_data
 * 2. Export them to a backup JSON file
 * 3. Delete them from the database
 * 
 * Run with: node tmp_rovodev_cleanup_old_dates.js
 */

const mongoose = require('mongoose');
const fs = require('fs');

// MongoDB connection string - UPDATE THIS WITH YOUR ACTUAL CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGO_CONNECTION_STRING';

// Date cutoff - all dates created before this will be backed up and deleted
const CUTOFF_DATE = new Date('2024-01-01');

const dateSchema = new mongoose.Schema({}, { strict: false, collection: 'dates' });
const Date = mongoose.model('Date', dateSchema);

async function backupAndDeleteOldDates() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Step 1: Find all old dates
        console.log('🔍 Finding old dates (before 2024-01-01)...');
        const oldDates = await Date.aggregate([
            {
                $match: {
                    created_at: { $lt: CUTOFF_DATE }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_name',
                    foreignField: 'user_name',
                    as: 'user_data'
                }
            }
        ]);

        console.log(`📊 Found ${oldDates.length} dates from before 2024-01-01\n`);

        // Separate dates with and without user_data
        const datesWithNoUser = oldDates.filter(d => !d.user_data || d.user_data.length === 0 || !d.user_data[0]?._id);
        const datesWithUser = oldDates.filter(d => d.user_data && d.user_data.length > 0 && d.user_data[0]?._id);

        console.log(`  ├─ ${datesWithNoUser.length} dates with missing/invalid user_data (will be deleted)`);
        console.log(`  └─ ${datesWithUser.length} dates with valid user_data (will be kept)\n`);

        if (datesWithNoUser.length === 0) {
            console.log('✅ No problematic dates found. Nothing to delete!');
            await mongoose.disconnect();
            return;
        }

        // Step 2: Backup to JSON file
        const backupFilename = `backup_deleted_dates_${new Date().toISOString().replace(/:/g, '-')}.json`;
        console.log(`💾 Creating backup file: ${backupFilename}...`);
        
        fs.writeFileSync(
            backupFilename,
            JSON.stringify({
                backup_date: new Date().toISOString(),
                total_count: datesWithNoUser.length,
                cutoff_date: CUTOFF_DATE,
                dates: datesWithNoUser
            }, null, 2)
        );
        
        console.log(`✅ Backup created successfully!\n`);

        // Step 3: Delete the dates
        console.log('🗑️  Deleting problematic dates from database...');
        
        const dateIds = datesWithNoUser.map(d => d._id);
        const result = await Date.deleteMany({ _id: { $in: dateIds } });

        console.log(`✅ Deleted ${result.deletedCount} dates\n`);

        // Summary
        console.log('═══════════════════════════════════════════');
        console.log('📊 SUMMARY');
        console.log('═══════════════════════════════════════════');
        console.log(`Total dates checked: ${oldDates.length}`);
        console.log(`Dates with valid users (kept): ${datesWithUser.length}`);
        console.log(`Dates with missing users (deleted): ${result.deletedCount}`);
        console.log(`Backup file: ${backupFilename}`);
        console.log('═══════════════════════════════════════════\n');

        await mongoose.disconnect();
        console.log('✅ Done! Database connection closed.');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the script
backupAndDeleteOldDates();
