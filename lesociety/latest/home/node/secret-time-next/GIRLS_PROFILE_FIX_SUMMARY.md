# Fix Summary: Girls Profile View - Experience Icon/Title

## Issue
New dates were not showing the experience icon and title properly on women's profiles.

## Root Cause
A **field name inconsistency** between:
1. How dates are stored in the database (field name variations)
2. How the lookup code searches for date categories

### The Problem
- **Old dates**: Stored with field name `middle_class_date` (without 's')
- **New dates**: Stored with field name `middle_class_dates` (with 's')
- **Lookup code**: Only checked for `middle_class_dates` (with 's')

When old dates were retrieved from the database, the lookup `date?.middle_class_dates` returned `undefined`, causing the category match to fail. This resulted in no icon and no label being displayed.

## Files Modified

### 1. `/modules/auth/forms/userProfile.js`
**Changes:**
- Line ~111: Added `|| item?.label === date?.middle_class_date` to handle old dates
- Line ~1081-1083: Added same check in the dates mapping function

**Before:**
```javascript
const selectedDateCategory = dateCategory.find(
  (item) =>
    item?.label === selectedDate?.standard_class_date ||
    item?.label === selectedDate?.middle_class_dates ||
    item?.label === selectedDate?.executive_class_dates
);
```

**After:**
```javascript
const selectedDateCategory = dateCategory.find(
  (item) =>
    item?.label === selectedDate?.standard_class_date ||
    item?.label === selectedDate?.middle_class_dates ||
    item?.label === selectedDate?.middle_class_date ||  // <-- ADDED
    item?.label === selectedDate?.executive_class_dates
);
```

### 2. `/core/UserCardList.js`
**Changes:**
- Line ~79-80: Added `|| item?.label === date?.middle_class_date`

### 3. `/utils/Utilities.js`
**Changes:**
- Updated dateCategory array entries to use consistent `middle_class_dates` naming:
  - "Take A Class": changed from `middle_class_date` to `middle_class_dates`
  - "Entertainment & Sports": changed from `middle_class_date` to `middle_class_dates`
  - "Wine & Dine": changed from `middle_class_date` to `middle_class_dates`

## Impact
- ✅ Old dates (with `middle_class_date` field) will now display correctly
- ✅ New dates (with `middle_class_dates` field) continue to work
- ✅ Both old and new dates will show the experience icon and title properly

## Testing Recommendations
1. View a women's profile with old dates (created before the new flow) - verify icons show
2. View a women's profile with new dates (created with the new flow) - verify icons show
3. Check the "Available Experiences" section on both mobile and desktop
4. Verify the date modal shows the correct icon and label when clicking a date

## Related Files
- Analysis document: `GIRLS_PROFILE_BUG_ANALYSIS.md`
- Issue tracker: `ISSUE_TRACKER.md` (updated to mark as fixed)
