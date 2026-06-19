# Secret Time - Design Audit Document

## Overview
This document provides a comprehensive audit of the current implementation against the Figma designs. It identifies all discrepancies and provides specific fix instructions.

---

## 1. CHAT SCREENS AUDIT

### 1.1 Men's Chat - No Activity (Empty State)
**File:** `components/inbox/EmptyState.js` (male section), `components/inbox/PendingRequests.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Background | Pure black #000000 | Correct | ✅ |
| "INBOX" header | White, uppercase, centered | Uses Tab component - needs custom header | ❌ |
| "Pending Requests" section title | Gray #888888, uppercase, 14px, letter-spacing 1px | Missing - needs to be added | ❌ |
| "All Quiet For Now" card | Dark gray bg, rounded 16px, centered text | Partially correct - QuietCard styled but needs adjustments | ⚠️ |
| Card title | White, 16px, font-weight 600 | Correct | ✅ |
| Card subtext | Gray #b0b0b0, 12px | Correct | ✅ |
| Status row text | Gray #888888, 12px | Correct | ✅ |
| "Active Conversations" header | Gray #888888, uppercase, 14px, letter-spacing 1px, border-bottom | Present but styling needs verification | ⚠️ |
| Empty illustration | nochat.png, 280px width, opacity 0.8 | Correct | ✅ |
| "No Active Conversations Yet" | White, 22px, font-weight 600 | Correct | ✅ |
| Subtext | Gray #b0b0b0, 14px | Correct | ✅ |

**Required Fixes:**
1. Add "INBOX" header with back arrow at top of page
2. Ensure "Pending Requests" and "Active Conversations" headers match design exactly
3. Add proper spacing between sections (32px)

### 1.2 Men's Chat - With Activity
**File:** `components/inbox/PendingRequests.js`, `pages/messages.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Pending request circles | 64px diameter, pink/red border 2px | RequestCircle has 64px, border #F24462 | ✅ |
| Profile images in circles | Cover fit, rounded | Correct | ✅ |
| Star badge on Super Interested | Red #F24462 circle, 20px, positioned top-right | Correct | ✅ |
| "48h" countdown badge | Small badge on profile images | NOT IMPLEMENTED | ❌ |
| Active conversation items | 16px padding, border-bottom, hover effect | Partially correct | ⚠️ |
| Profile image in list | 48px circular | Uses 32px - NEEDS FIX | ❌ |
| Username | White, 15px, font-weight 600 | Correct | ✅ |
| Star icon for Super Interested | Red star BEFORE name | Implemented but verify position | ⚠️ |
| Message preview | Gray #b0b0b0, 13px, ellipsis | Correct | ✅ |
| Unread preview | White, font-weight 600 | Correct | ✅ |
| Timestamp | Gray #888888, 12px | Correct | ✅ |
| Unread dot | Red #F24462, 10px circle | Correct | ✅ |

**Required Fixes:**
1. Increase profile image size in conversation list from 32px to 48px
2. Add "48h" countdown badge to pending request circles
3. Ensure proper spacing and alignment

### 1.3 Ladies Chat - No Activity
**File:** `components/inbox/EmptyState.js` (female section), `components/inbox/NewInterests.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| "New Interests" header | Gray #888888, uppercase, 14px, centered | Correct | ✅ |
| Interest card | Dark bg rgba(255,255,255,0.05), rounded 12px | Correct | ✅ |
| Interest text | White, 14px, font-weight 500 | Correct | ✅ |
| Active dates subtext | Gray #888888, 12px | Correct | ✅ |
| Gradient ring | 80px, bestring.png | Correct | ✅ |
| Ring value | White, 22px, bold, centered | Correct | ✅ |
| Empty illustration | Same as men's | Correct | ✅ |
| "CREATE NEW DATE" button | Coral #FF6B6B, full width, rounded 8px, 14px bold | Uses gradient #F24462 to #E2466B - MATCHES | ✅ |
| Button visibility | Only when 0 active dates | Correct | ✅ |

**Required Fixes:**
1. Verify button color matches exactly (#FF6B6B vs current gradient)

### 1.4 Ladies Chat - With Activity
**File:** `components/inbox/NewInterests.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Interest count display | "You have X new interest(s)" | Correct | ✅ |
| "about to expire" text | Small text below count | NOT IMPLEMENTED | ❌ |
| "Total expired interests" | Small gray text | NOT IMPLEMENTED | ❌ |
| Progress ring with count | Gradient ring showing interests | Uses bestring.png - verify gradient matches | ⚠️ |

**Required Fixes:**
1. Add "X interests about to expire" text
2. Add "Total expired interests: (X)" text

### 1.5 Ladies Timer/Expiration View (New Screen)
**File:** NOT YET IMPLEMENTED

This is a new screen that needs to be created:
- Header: "[Name] is Super Interested" with star icon
- Large profile image with rounded corners (16px)
- Quote overlay at bottom of image
- Progress bar showing expiration time (32 hours)
- "You've been granted profile access" text
- "VIEW PROFILE" button (outlined, dark)
- "REPLY" button (solid coral #FF6B6B)
- "Reject User" text link (small, gray)

**Status:** NEW FEATURE - Needs implementation

---

## 2. PAYWALLS AUDIT

### 2.1 Ladies' Paywall
**File:** `core/PaywallModal.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Animation | Slide up from bottom, background blur | Verify implementation | ⚠️ |
| Header | "Don't let your new interests slip away" | Verify copy | ⚠️ |
| Subtext | "Your first 15 introductions were on us..." | Verify copy | ⚠️ |
| Pricing | "$25 for 100 chats" / "Limited time only" | Verify styling | ⚠️ |
| Progress bar | Gradient (blue to pink), shows expiration | Verify gradient colors | ⚠️ |
| "Request expires in..." text | Below progress bar | Verify copy says "This Interest expires in..." | ❌ |
| "VIEW PRICING" button | Coral #FF6B6B, full width | Verify color and width | ⚠️ |
| Footer | "Pay only for what you use. No recurring fees." | Verify copy | ⚠️ |

**Required Fixes:**
1. Update text to say "This Interest expires in..." instead of "Request expires in..."
2. Ensure gradient progress bar uses correct colors (blue #4169E1 to pink #FF1493 to coral #FF6B6B)
3. Verify all copy matches Figma exactly

### 2.2 Men's Paywall
**File:** `core/PaywallModal.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Animation | Slide up from bottom | Verify | ⚠️ |
| Header | "She's Offering A First Date! Don't Miss It." | Verify copy | ⚠️ |
| Subtext | "She's real, verified, and driven..." | Verify copy, avoid orphan words | ⚠️ |
| Offer | "50% Off All Tokens. Limited-Time Only" | Verify styling | ⚠️ |
| Countdown | "Exclusive offer ends in 48 hours" | Verify | ⚠️ |
| Progress bar | Gradient fill | Verify | ⚠️ |
| "View Token Pricing" button | Coral #FF6B6B | Verify | ⚠️ |
| Footer | "This plan is only available for a limited time..." | Verify copy | ⚠️ |

**Required Fixes:**
1. Ensure text doesn't have orphan words (single words on new lines)
2. Verify all copy matches Figma

---

## 3. POPUPS AUDIT

### 3.1 Success Popup (After Posting Date)
**File:** `core/createDatePopup.js` or similar

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Animation | Slide up from bottom, NO blur effect | Verify no blur | ⚠️ |
| Header | "Success. You're live!" | Verify | ⚠️ |
| Body text | "Our gentleman's profiles remain private..." | Verify copy | ⚠️ |
| Subtext | "While you wait, explore other women's dates..." | Verify | ⚠️ |
| Checkbox | "Do not show me again" | Verify position above button | ⚠️ |
| "OK, GOT IT!" button | Coral #FF6B6B, centered | Verify styling | ⚠️ |
| Close action | Slide down to close | Verify animation | ⚠️ |

**Required Fixes:**
1. Ensure this popup has NO background blur (unique to this popup)
2. Verify checkbox is positioned correctly

### 3.2 Create Date Intro Popup
**File:** NOT YET IMPLEMENTED

This appears when ladies click "CREATE NEW DATE":
- Header: "Want offers to flood in fast?"
- Body: "Ladies who post a few tempting date options..."
- Subtext: "Create up to 4 dates and never get lost in the crowd..."
- Checkbox: "Don't show me this again"
- Button: "OK, GOT IT!" (coral)

**Status:** NEW FEATURE - Needs implementation

### 3.3 Max Dates Reached Popup
**File:** `modules/date/CreatedatesWarningPopUp.js` or `core/CreateDateGateModal.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Header | "You've reached your limit." | Verify | ⚠️ |
| Body | "You can have up to 4 dates posted..." | Verify copy | ⚠️ |
| Subtext | "We'll unlock more dates soon!" | Verify | ⚠️ |
| Button | "OK, GOT IT!" text only, coral color | Verify styling (not filled button) | ❌ |
| No checkbox | This popup should NOT have "don't show again" | Verify | ⚠️ |

**Required Fixes:**
1. Button should be text-only (not filled), coral color

---

## 4. PRICING AUDIT

### 4.1 Ladies' Pricing
**File:** `core/PricingMenuModal.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Card 1 - A La' Carte | Dark bg, rounded corners | Verify | ⚠️ |
| Title | "A La' Carte" | Verify | ⚠️ |
| Subtitle | "Pay As You Go" | Verify | ⚠️ |
| Price | "50 cents/ Per new chat" | Verify | ⚠️ |
| Counter | [-] 0 [+] with pink buttons | Verify styling | ⚠️ |
| Features | Bullet points with dashes | Verify format | ⚠️ |
| Gradient arrow | Pink/purple gradient graphic | Verify presence | ⚠️ |
| Card 2 - Queens Bundle | Pink border when selected | Verify selected state | ⚠️ |
| Lightning bolt icon | Before "Maximize Your Experience" | Verify presence | ⚠️ |
| "100 New Chats" | Large text | Verify | ⚠️ |
| "Best Value" text | Small text at bottom | Verify | ⚠️ |
| Footer | "*Min purchase of $10" | Verify | ⚠️ |
| Checkout button | "($25) Proceed to Checkout", coral, full width | Verify dynamic pricing | ⚠️ |
| Button state | Gray when $0, coral when meets minimum | Verify state change | ❌ |

**Required Fixes:**
1. Ensure button is gray when total is $0, turns coral when minimum purchase is met
2. Add gradient arrow graphics to cards
3. Add lightning bolt icon to Queens Bundle
4. Implement card edge lighting on selection

### 4.2 Men's Pricing
**File:** `core/PricingMenuModal.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Card 1 - Interested | Dark bg | Verify | ⚠️ |
| Title | "Interested" in script font | Verify font | ❌ |
| Subtitle | "Show You're Committed" | Verify | ⚠️ |
| Price | "$2/message" | Verify | ⚠️ |
| Counter | [-] 0 [+] | Verify | ⚠️ |
| Features | Bullet points with descriptions | Verify | ⚠️ |
| Card 2 - Super Interested | Pink border when selected | Verify | ⚠️ |
| Title | "Super Interested" with "Super" in pink script | Verify styling | ❌ |
| Lightning bolt | Before subtitle | Verify | ⚠️ |
| Price | "$4/message" | Verify | ⚠️ |
| "3x more responses" text | In features | Verify | ⚠️ |
| Footer | "*Min purchase of $25" | Verify | ⚠️ |
| Checkout button | Dynamic pricing, gray when $0 | Verify state | ❌ |

**Required Fixes:**
1. Use script font for "Interested" and "Super Interested" titles
2. "Super" should be pink in "Super Interested"
3. Button state should change based on minimum purchase
4. Add gradient arrow graphics

---

## 5. SIDEBAR AUDIT

### 5.1 Female Sidebar
**File:** `core/sidebar.js`, `styles/sidebar-tokens.css`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Profile photo | 80px circular | Verify | ⚠️ |
| Username | White, 16px | Verify | ⚠️ |
| Member since | Gray, small text | Verify | ⚠️ |
| "View Profile" / "Edit Profile" buttons | Small, dark bg, rounded | Verify | ⚠️ |
| Membership status card | Dark bg, rounded | Verify | ⚠️ |
| Plan name | "Test Drive - Limited Access" or "VIP Pass" or "Priority Pass" | Verify copy | ⚠️ |
| Token circle | 100px, gradient ring (pink/purple) | Verify gradient | ⚠️ |
| "Conversations Left" label | Small text below circle | Verify | ⚠️ |
| Count in circle | Large white number | Verify | ⚠️ |
| "Top Up Tokens" button | Outlined, gradient border, dark bg | Verify styling | ❌ |
| Status badge | "PENDING" with clock icon | Verify | ⚠️ |
| "CREATE NEW DATE" button | Coral #FF6B6B, full width | Verify | ✅ |
| Menu items | Settings, Privacy, Terms with chevrons | Verify | ⚠️ |
| "LOG OUT" button | Dark gray, full width | Verify | ⚠️ |
| Copyright | "SecretTime. Copyright 2021" | Verify | ⚠️ |

**Required Fixes:**
1. "Top Up Tokens" button should have gradient border (pink to purple), not solid
2. Ensure gradient ring uses correct colors

### 5.2 Male Sidebar
**File:** `core/sidebar.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Profile section | Same as female | Verify | ⚠️ |
| Plan name | "The Test Drive - Limited Access" or "Priority Member - Full Access" | Verify copy | ⚠️ |
| Two token circles | "Interested" and "Super Interested" | Verify layout | ⚠️ |
| Circle values | Numbers inside gradient rings | Verify | ⚠️ |
| "Locked" state | When no tokens, show "Locked" text | Verify | ⚠️ |
| "Top Up Tokens" button | Same gradient border style | Verify | ❌ |
| "VERIFY PROFILE" button | Dark bg, checkmark icon | Verify | ⚠️ |
| "Let them know you are real" text | Below verify button | Verify | ⚠️ |

**Required Fixes:**
1. Implement gradient border for "Top Up Tokens" button
2. Ensure "Locked" text appears when token count is 0

---

## 6. CREATE DATE FLOW AUDIT

### 6.1 Progress Bar (All Pages)
**File:** All create-date pages

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Steps | Location, Experience, Earnings, Duration, Description, Preview | Verify all 6 steps | ⚠️ |
| Active step | White text, slightly larger | Verify | ⚠️ |
| Inactive steps | Dimmed but legible | Verify | ⚠️ |
| Progress fill | Gradient (blue to pink), smooth animation | Verify gradient and animation | ❌ |
| Fill behavior | Loads to center of next step word | Verify | ⚠️ |

**Required Fixes:**
1. Implement gradient progress bar (blue #4169E1 to pink #FF1493 to coral #FF6B6B)
2. Ensure smooth animation between steps
3. Active step should be white and slightly larger

### 6.2 Page 1: Location
**File:** `pages/create-date/choose-city.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Header | "Where does your adventure start? Pick your city." | Verify | ⚠️ |
| Subtext | "Want to be discoverable in multiple cities?..." | Verify | ⚠️ |
| Input field | Dark bg, rounded, location pin icon | Verify | ⚠️ |
| "NEXT" button | Coral #FF6B6B, full width, arrow icon | Verify | ⚠️ |
| Button position | Fixed at bottom | Verify | ⚠️ |

### 6.3 Page 6: Preview
**File:** `pages/create-date/review.js`

| Element | Design Spec | Current Implementation | Status |
|---------|-------------|------------------------|--------|
| Header | "You're almost done! Take a moment to review your date." | Verify | ⚠️ |
| Profile card | Large image, rounded corners | Verify | ⚠️ |
| "Swap Image" button | Top right of image, small, dark bg | NOT IMPLEMENTED | ❌ |
| Name and age | "Anna, 24" with location | Verify | ⚠️ |
| Location | "Toronto, ON" with pin icon | Verify | ⚠️ |
| Category badge | "Entertainment & Sports" | Verify | ⚠️ |
| Occupation | "Chef" with "ASPIRING" label | Verify | ⚠️ |
| Date details | Time frame, prices | Verify | ⚠️ |
| "EDIT" button | Outlined, dark bg, white text | Verify | ⚠️ |
| "POST DATE" button | Solid coral #FF6B6B | Verify | ⚠️ |

**Required Fixes:**
1. Implement "Swap Image" button functionality
2. Image should cycle through user's uploaded photos
3. Hide swap button when less than 2 images available

---

## GLOBAL DESIGN SYSTEM

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| --color-bg-primary | #000000 | Main background |
| --color-bg-card | #1A1A1A | Card backgrounds |
| --color-bg-card-hover | rgba(255,255,255,0.05) | Hover states |
| --color-accent-primary | #FF6B6B | Primary buttons, highlights |
| --color-accent-secondary | #F24462 | Alternative accent (close to primary) |
| --color-accent-pink | #FF1493 | Gradient end |
| --color-accent-blue | #4169E1 | Gradient start |
| --color-text-primary | #FFFFFF | Headings, primary text |
| --color-text-secondary | #B0B0B0 | Body text, descriptions |
| --color-text-tertiary | #888888 | Labels, hints |

### Typography
| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 (page titles) | Conv_Helvetica | 24px | 600 | 1.3 |
| H2 (section headers) | Conv_Helvetica | 18px | 600 | 1.4 |
| H3 (card titles) | Conv_Helvetica | 16px | 600 | 1.4 |
| Body | Conv_Helvetica | 14px | 400 | 1.5 |
| Small/Caption | Conv_Helvetica | 12px | 400 | 1.5 |
| Button | Conv_Helvetica | 14px | 700 | 1 |
| Label (uppercase) | Conv_Helvetica | 14px | 500 | 1 |

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| --space-xs | 8px | Tight spacing |
| --space-sm | 12px | Small gaps |
| --space-md | 16px | Standard padding |
| --space-lg | 20px | Section padding |
| --space-xl | 32px | Large gaps |
| --space-xxl | 40px | Section margins |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 8px | Buttons, inputs |
| --radius-md | 12px | Cards |
| --radius-lg | 16px | Large cards, modals |
| --radius-full | 50% | Circular elements |

---

## PRIORITY FIXES (In Order)

### Critical (Breaks Design)
1. **Create Date Progress Bar** - Implement gradient and animation
2. **Pricing Card Selection** - Add edge lighting effect
3. **Button States** - Gray when inactive, coral when active
4. **Profile Image Size** - Change from 32px to 48px in chat list

### High (Visual Impact)
5. **Paywall Copy Updates** - Match Figma exactly
6. **Sidebar Gradient Borders** - Implement on "Top Up Tokens" button
7. **Popup Animations** - Ensure slide-up and blur effects
8. **Typography** - Script font for pricing titles

### Medium (Polish)
9. **Swap Image Button** - Implement on preview page
10. **Countdown Badges** - Add to pending requests
11. **Checkbox Positioning** - Verify in popups
12. **Spacing Consistency** - Audit all padding/margins

### Low (Nice to Have)
13. **Hover Effects** - Add subtle transitions
14. **Loading States** - Center animations in buttons
15. **Edge Cases** - Empty states, error states

---

## FILES TO MODIFY

### High Priority
- `core/PaywallModal.js`
- `core/PricingMenuModal.js`
- `core/sidebar.js`
- `styles/sidebar-tokens.css`
- `pages/create-date/choose-city.js`
- `pages/create-date/review.js`
- `components/inbox/PendingRequests.js`
- `components/inbox/NewInterests.js`
- `pages/messages.js`

### Medium Priority
- `core/createDatePopup.js`
- `modules/date/CreatedatesWarningPopUp.js`
- `components/inbox/EmptyState.js`
- `components/inbox/InboxView.js`

### New Files Needed
- Ladies timer/expiration view component
- Create date intro popup

---

*Document generated on: 2026-02-09*
*Last updated: Initial audit*
