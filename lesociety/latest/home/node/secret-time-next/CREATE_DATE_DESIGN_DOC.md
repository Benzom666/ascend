# CREATE DATE FLOW - DESIGN DOCUMENTATION

## Overview
Complete redesign of the create date flow with dark theme (#000000), pink accent (#FF3B81), and Inter font.

---

## STEP 1: Choose Date Type (Image 6)
**Route:** `/create-date/choose-date-type`

### Design Elements:
- **Header:** "CREATE NEW DATE" with back arrow & X
- **Tabs:** Location, Experience, Earnings, Duration, Description, Preview
- **Progress:** First tab active
- **Title:** "Choose your date"
- **Subtitle:** "Select the type of date you want to create"

### Content:
- **Grid Layout:** 2 columns mobile, 3 columns desktop
- **Cards:** 6 date type cards with:
  - Emoji icon (large, top center)
  - Label (bold, white)
  - Description (gray, smaller)
  - Time range (lighter gray, smallest)
- **Card Style:**
  - Background: #1A1A1A
  - Border: 1px solid #333333
  - Selected: Pink border #FF3B81, pink background tint
  - Rounded: 12px
  - Padding: 20-24px

### Date Types:
1. ☕ Brunch Date - "Morning coffee & conversation" - "10 AM - 2 PM"
2. 🍽️ Lunch Date - "Midday meal together" - "12 PM - 3 PM"
3. 🌙 Dinner Date - "Evening dining experience" - "6 PM - 10 PM"
4. 🎉 Night Out - "Drinks & evening activities" - "8 PM - Late"
5. 🏖️ Weekender - "Weekend getaway" - "Flexible"
6. ✈️ Getaway - "Travel destination date" - "Multi-day"

### Navigation:
- **Bottom:** Fixed pink NEXT button
- **Disabled state:** Gray when no selection

---

## STEP 2: Aspiration & Price (Image 7)
**Route:** `/create-date/date-event`

### Design Elements:
- **Title:** "Your aspiration. Your price."
- **Layout:** TWO COLUMN layout

### Left Column - Category & Aspiration:
- **Section 1 Label:** "1. Who do you aspire to be?"
- **Sublabel:** "Your selection will be locked for 30 days"
- **Category Dropdown:**
  - Placeholder: "Select A Category"
  - Black background (#000000)
  - White text
  - Border: 1px #333333
  - Rounded: 8px
  - Full width
- **Aspiration Dropdown:** (appears after category selected)
  - Placeholder: "Select Your Aspiration"
  - Same styling as category

### Right Column - Price:
- **Section 2 Label:** "2. Set your suggested financial gift"
- **Description:** "He hands you the gift in person on the date to help support your goals. Showing his commitment."
- **Price Grid:** 3 columns x 3 rows
- **Price Cards:**
  - Values: $50, $75, $100, $150, $200, $250, $300, $400, $500
  - Background: #000000
  - Border: 1px #333333
  - Selected: Pink #FF3B81
  - Text: White (unselected), Pink (selected)
  - Padding: 16px
  - Rounded: 8px
- **Pro Tip:** "Pro tip: Women who post multiple dates at different price points get 3-5x more Super Interested offers."

### Navigation:
- **Bottom:** Fixed pink NEXT button

---

## STEP 3: Duration (Image 8)
**Route:** `/create-date/duration`

### Design Elements:
- **Title:** "How long will this date take?"
- **Subtitle:** "Set the expected duration so he knows how much time to block off for your special date."

### Content:
- **Grid:** 4 columns x 2 rows (8 options total)
- **Duration Cards:**
  - Values: "1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours", "7 hours", "8+ hours"
  - Background: #1A1A1A
  - Border: 1px #333333
  - Selected: Pink border #FF3B81
  - Text: White (unselected), Pink (selected)
  - Centered text
  - Rounded: 12px
  - Padding: 24px

### Navigation:
- **Bottom:** Fixed pink NEXT button

---

## STEP 4: Description (Image 9)
**Route:** `/create-date/description`

### Design Elements:
- **Title:** "Set the mood"
- **Subtitle:** "Describe what you'll do together, what makes this date special, and what you're looking forward to."

### Content:
- **Textarea:**
  - Background: #000000
  - Border: 1px #333333
  - Pink border on focus
  - White text
  - Rounded: 8px
  - Min-height: 200px
  - Padding: 16px
  - Placeholder text visible
- **Character Counter:** Right aligned, gray - "X/500 characters"
- **Tips Section:**
  - Background: rgba(255,255,255,0.05)
  - Border: 1px rgba(255,255,255,0.1)
  - Title: "Pro tips:"
  - List items:
    - "Be specific about activities"
    - "Mention what makes you excited"
    - "Keep it authentic and fun"

### Navigation:
- **Bottom:** Fixed pink NEXT button

---

## STEP 5: Location (Image 10) - OPTIONAL/SKIPPED?
**Route:** `/create-date/location`

### Design Elements:
- **Title:** "Where does your adventure start?"
- **Subtitle:** "Pick your city."
- **Helper Text:** "Want to be discoverable in multiple cities? Just create a separate date for each one."

### Content:
- **Input Field:**
  - Icon: Location pin (left side)
  - Placeholder: City name
  - Background: #1A1A1A
  - Border: 1px #333333
  - White text
  - Rounded: 8px
  - Height: 48px
  - Left padding: 50px (for icon)

### Navigation:
- **Bottom:** Fixed pink NEXT button

**NOTE:** This might be a separate initial step or might be removed from main flow. Need to check actual requirements.

---

## STEP 6: Preview/Review (Image 11)
**Route:** `/create-date/review`

### Design Elements:
- **Title:** "Review your date"
- **Subtitle:** "Check all the details before publishing your date."

### Content:
- **Review Sections:** Each in a dark card with Edit button
- **Sections:**
  1. Date Type - [Edit button]
  2. Category & Aspiration - [Edit button]
  3. Financial Gift - [Edit button]
  4. Duration - [Edit button]
  5. Description - [Edit button]
  6. Location - [Edit button]

### Section Styling:
- Background: #1A1A1A
- Border: 1px #333333
- Rounded: 12px
- Padding: 20px
- Header with label and Edit button
- Content below
- Edit button: Gray border, ghost style

### Navigation:
- **Bottom:** Fixed pink "CREATE DATE" button
- **Loading State:** Shows spinner when submitting

---

## STEP 7: Success (Image 12)
**Route:** `/create-date/success`

### Design Elements:
- **Icon:** Large green checkmark
- **Title:** "Your date has been created!"
- **Subtitle:** "Get ready for amazing Super Interested offers"

### Content:
- **Date Card:**
  - Shows all details in 2-column grid
  - Emojis for each detail
  - Labels (uppercase, gray)
  - Values (white)
  - Price badge in green
- **Tips Section:** Green tinted background
  - Title: "What happens next?"
  - 4 bullet points
- **Action Buttons:**
  - Primary: "View Your Dates" (white background)
  - Secondary: "Create Another Date" (ghost border)

---

## GLOBAL DESIGN TOKENS:

### Colors:
- **Background:** #000000 (pure black)
- **Card Background:** #1A1A1A
- **Primary/Accent:** #FF3B81 (pink)
- **Text Primary:** #FFFFFF (white)
- **Text Secondary:** #CCCCCC (light gray)
- **Text Tertiary:** #999999 (medium gray)
- **Border Default:** #333333
- **Border Selected:** #FF3B81
- **Success:** #4ade80 (green)

### Typography:
- **Font Family:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- **Headings:** 600-700 weight
- **Body:** 400 weight
- **Sizes:**
  - Mobile: Title 24px, Subtitle 14px
  - Desktop: Title 32px, Subtitle 16px

### Spacing:
- **Mobile Padding:** 16px horizontal, 24px vertical
- **Desktop Padding:** 32px horizontal, 40px vertical
- **Gaps:** 12-16px mobile, 16-24px desktop

### Border Radius:
- **Cards:** 12px
- **Buttons/Inputs:** 8px

### Shadows:
- Minimal, mostly borders
- No heavy shadows

---

## NAVIGATION FLOW:

Based on tabs: Location → Experience → Earnings → Duration → Description → Preview

**ACTUAL FLOW from designs:**
1. Choose Date Type (Experience)
2. Category & Price (Earnings)
3. Duration
4. Description
5. [Location?] - might be separate or optional
6. Preview/Review
7. Success

**API ENDPOINT:**
- POST /dates
- Payload includes: date_type, category, aspiration, price, duration, description, location, is_public_location

---

## ISSUES TO FIX:

1. **Location page appearing twice** - First location page (choose city) should NOT have country field, just city selection
2. **Final preview API error** - Check API endpoint and payload structure
3. **Pages not matching designs** - Rebuild all pages pixel-perfect to this document
4. **Missing fields** - Ensure all required fields are collected before submission
