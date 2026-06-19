const dates = require('../../models/dates');

/**
 * DELETE ALL DATES BEFORE 2025
 * 
 * GET /api/v1/cleanup/before-2025?secret=lesociety_cleanup_2024
 */
exports.cleanupBefore2025 = async (req, res) => {
    try {
        const secret = req.query.secret;
        const CLEANUP_SECRET = process.env.CLEANUP_SECRET || 'lesociety_cleanup_2024';
        
        if (secret !== CLEANUP_SECRET) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. Invalid secret key.'
            });
        }

        const CUTOFF_DATE = new Date('2025-01-01T00:00:00.000Z');

        console.log('🔍 Finding all dates before January 1, 2025...');
        
        const oldDates = await dates.find({
            created_at: { $lt: CUTOFF_DATE }
        }).lean();

        console.log(`📊 Found ${oldDates.length} dates created before 2025`);

        if (oldDates.length === 0) {
            return res.json({
                success: true,
                message: 'No dates found before 2025!',
                stats: { total_found: 0, deleted: 0 }
            });
        }

        const backupData = {
            backup_date: new Date().toISOString(),
            total_count: oldDates.length,
            cutoff_date: CUTOFF_DATE.toISOString(),
            reason: 'Created before January 1, 2025',
            dates: oldDates.map(d => ({
                _id: d._id,
                user_name: d.user_name,
                location: d.location,
                province: d.province,
                created_at: d.created_at,
                status: d.status
            }))
        };

        console.log('🗑️  Deleting all dates before 2025...');
        const dateIds = oldDates.map(d => d._id);
        const result = await dates.deleteMany({ _id: { $in: dateIds } });

        console.log(`✅ Deleted ${result.deletedCount} dates`);

        return res.json({
            success: true,
            message: `Deleted all ${result.deletedCount} dates before 2025!`,
            stats: {
                total_found: oldDates.length,
                deleted: result.deletedCount
            },
            backup: {
                note: 'SAVE THIS! Backup data included in response.',
                data: backupData
            }
        });

    } catch (error) {
        console.error('❌ Cleanup error:', error);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Cleanup failed',
            error: error.message,
            stack: error.stack,
            details: error.toString()
        });
    }
};
