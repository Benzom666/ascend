# Girls Profile View - Experience Icon/Title Bug Analysis

## Problem
New dates are not showing the experience icon and title properly on women's profiles.

## Root Cause

The issue is in the **field name mismatch** between:
1. How dates are stored in the database
2. How the lookup code searches for the date category

### Date Storage (createStepOne.js)
When creating dates, the category field name used is `middle_class_dates` (with 's'):
```javascript
{
  id: "TakeClass",
  label: "Take A Class",
  category: "middle_class_dates",  // <-- WITH 's'
}
```

This gets stored in the database as:
```javascript
{
  middle_class_dates: "Take A Class"
}
```

### Date Lookup (userProfile.js & UserCardList.js)
The lookup code searches for:
```javascript
const category = dateCategory.find(
  (item) =>
    item?.label === date?.standard_class_date ||
    item?.label === date?.middle_class_dates ||  // <-- WITH 's'
    item?.label === date?.executive_class_dates
);
```

### The Mismatch
While the lookup uses `middle_class_dates` (with 's'), there may be:
1. **Old dates** in the database stored with `middle_class_date` (without 's')
2. **API response** that may use different field names

Additionally, in `Utilities.js` dateCategory array, there's inconsistency:
- `"Get Sporty"`: category: "middle_class_dates" (with 's')
- `"Take A Class"`: category: "middle_class_date" (without 's')
- `"Entertainment & Sports"`: category: "middle_class_date" (without 's')
- `"Wine & Dine"`: category: "middle_class_date" (without 's')

## Fix Required

The lookup code needs to check for BOTH field name variations:
- `middle_class_date` (without 's') - for old dates
- `middle_class_dates` (with 's') - for new dates

## Files to Fix

1. `/home/benzom/.openclaw/workspace/lesoceity/lesociety/latest/home/node/secret-time-next/modules/auth/forms/userProfile.js`
   - Line ~111: Add `|| item?.label === date?.middle_class_date`
   - Line ~1050: Add `|| item?.label === date?.middle_class_date`

2. `/home/benzom/.openclaw/workspace/lesoceity/lesociety/latest/home/node/secret-time-next/core/UserCardList.js`
   - Similar fix needed for the category lookup

3. `/home/benzom/.openclaw/workspace/lesoceity/lesociety/latest/home/node/secret-time-next/utils/Utilities.js`
   - Fix dateCategory array to use consistent category names (all with 's')
