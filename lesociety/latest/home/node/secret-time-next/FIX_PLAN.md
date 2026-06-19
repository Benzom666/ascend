# CORRECTED CREATE DATE FLOW - FIX DOCUMENTATION

## ISSUES IDENTIFIED:

### 1. **Duplicate Location Pages**
- `choose-city.js` (OLD) - Has Country + City fields - This is STEP 0
- `location.js` (NEW) - Simple location input - This appears at STEP 5 and is WRONG

### 2. **Wrong Flow Order**
The current flow is:
1. choose-city (Country + City) ← WRONG - shouldn't have country
2. choose-date-type
3. date-event (Category + Price)
4. duration
5. description
6. location ← DUPLICATE - shouldn't be here
7. review
8. success

### 3. **API Error**
- API endpoint might be: `/dates` (POST)
- Need to check exact payload structure

---

## CORRECT FLOW (Based on Designs):

### STEP 0: Choose City (INITIAL STEP)
**Route:** `/create-date/choose-city` (EXISTING - needs fix)
**Design:** Image with "Where does your adventure start?"
- Remove Country field
- Keep ONLY City field
- Use location API for city autocomplete
- Save to localStorage

### STEP 1: Choose Date Type
**Route:** `/create-date/choose-date-type`
**Design:** Image 6
- Grid of 6 date types with emojis
- Save to localStorage

### STEP 2: Aspiration & Price
**Route:** `/create-date/date-event` (EXISTING - needs fix)
**Design:** Image 7
- Category dropdown
- Aspiration dropdown
- Price grid ($50-$500)
- Save to localStorage

### STEP 3: Duration
**Route:** `/create-date/duration` (EXISTING - needs fix)
**Design:** Image 8
- Grid of 8 duration options
- Save to localStorage

### STEP 4: Description
**Route:** `/create-date/description` (EXISTING - needs fix)
**Design:** Image 9
- Textarea with character counter
- Tips section
- Save to localStorage

### STEP 5: Review/Preview
**Route:** `/create-date/review` (EXISTING - needs fix)
**Design:** Image 11
- Review all details
- Edit buttons
- Submit to API: POST /dates

### STEP 6: Success
**Route:** `/create-date/success` (EXISTING - needs fix)
**Design:** Image 12
- Success message
- Date details
- Action buttons

---

## ACTION ITEMS:

### 1. Fix choose-city.js
- Remove Country dropdown
- Keep only City input
- Use new dark theme design
- Match Image 10 design exactly

### 2. Delete location.js
- Remove the duplicate location page at step 5
- Update navigation to skip this step

### 3. Fix API Submission
- Check actual API endpoint
- Ensure correct payload structure
- Handle errors properly

### 4. Update All Pages
- Apply dark theme (#000000)
- Apply pink accent (#FF3B81)
- Use Inter font
- Match designs pixel-perfect

---

## API PAYLOAD STRUCTURE:

Based on existing code (choose-city.js line 59-65):
```javascript
{
  user_name: string,
  current_page: number,
  per_page: number
}
```

For date creation (need to verify):
```javascript
{
  date_type: string,        // brunch, lunch, dinner, etc.
  category: string,         // category ID
  aspiration: string,       // aspiration ID
  price: number,           // 50, 75, 100, etc.
  duration: string,         // "1 hour", "2 hours", etc.
  description: string,      // text description
  location: string,         // city name
  country_code?: string,    // from choose-city
  province?: string,        // from choose-city
  date_status?: boolean     // true to publish, false for draft
}
```

---

## LOCAL STORAGE STRUCTURE:

```javascript
{
  selectedDateType: string,      // from step 1
  selectedCategory: string,      // from step 2
  selectedAspiration: string,    // from step 2
  selectedPrice: number,         // from step 2
  selectedDuration: string,      // from step 3
  description: string,           // from step 4
  location: string,              // from step 0 (choose-city)
  country_code?: string,         // from step 0
  province?: string              // from step 0
}
```

---

## NAVIGATION FLOW (CORRECTED):

```
1. /create-date/choose-city (Step 0)
   ↓ Next
2. /create-date/choose-date-type (Step 1)
   ↓ Next
3. /create-date/date-event (Step 2)
   ↓ Next
4. /create-date/duration (Step 3)
   ↓ Next
5. /create-date/description (Step 4)
   ↓ Next
6. /create-date/review (Step 5)
   ↓ CREATE DATE (API call)
7. /create-date/success (Step 6)
```

---

## FILES TO MODIFY:

1. **choose-city.js** - Remove country field, redesign to match Image 10
2. **choose-date-type.js** - Already correct, minor tweaks
3. **SIMPLE_CreateStepTwo.js** - Already correct, minor tweaks
4. **duration.js** - Already correct, minor tweaks
5. **description.js** - Update navigation (remove location step)
6. **location.js** - DELETE THIS FILE
7. **review.js** - Update navigation, fix API call
8. **success.js** - Update navigation
