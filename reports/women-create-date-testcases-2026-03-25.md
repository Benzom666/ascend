# Women's Create Date Flow Test Cases

Date: 2026-03-25
Scope: Current repo at `v2`, compared against original behavior from `/home/benzom/Downloads/latest`

## Test Data

- Female user with valid profile: `afro@yopmail.com / 123456`
- At least 4 verified profile images available on the female account
- At least 1 live date available for edit-flow tests
- At least 1 draft date available for draft-resume tests

## Expected Legacy Behavior Baseline

- New create flow is a step-by-step wizard.
- Draft flow resumes the unfinished draft instead of creating a second draft.
- Existing live-date edit flow is description-only in practice.
- Posting a date publishes the saved draft instead of duplicating it.
- A woman cannot exceed the active-date limit.

## A. Create Flow From Scratch

### TC-A01 Open create-date entry
- Precondition: No draft date exists.
- Steps:
  1. Open create-date entry from user list/profile.
  2. Observe first screen.
- Expected:
  - User lands on `choose-city`.
  - No unexpected redirect to draft/review.
  - Header progress starts at step 1.

### TC-A02 Choose city manually
- Steps:
  1. Type a valid city.
  2. Select a suggestion.
  3. Click `Next`.
- Expected:
  - Selected city persists.
  - User moves to date type step.

### TC-A03 Use current location
- Steps:
  1. Tap location icon.
  2. Allow geolocation.
  3. Click `Next`.
- Expected:
  - City field is populated.
  - User moves to date type step.

### TC-A04 Date type selection
- Steps:
  1. Select each date type one by one.
  2. Verify selection state.
  3. Click `Next`.
- Expected:
  - Only one type is selected at a time.
  - Selection persists after page refresh/back-forward.

### TC-A05 Category, aspiration, price
- Steps:
  1. Select category.
  2. Select aspiration.
  3. Select price.
  4. Click `Next`.
- Expected:
  - All fields persist.
  - User moves to duration step.
  - No silent reset.

### TC-A06 Duration selection
- Steps:
  1. Select each duration option.
  2. Click `Next`.
- Expected:
  - Selected duration persists.
  - User moves to description step.

### TC-A07 Description minimum validation
- Steps:
  1. Leave description empty.
  2. Click `Next`.
  3. Enter fewer than 20 trimmed characters.
  4. Click `Next`.
- Expected:
  - Inline validation appears.
  - User stays on description step.
  - No draft is incorrectly published.

### TC-A08 Description maximum validation
- Steps:
  1. Enter more than 500 characters.
  2. Click `Next`.
- Expected:
  - Inline validation appears.
  - User stays on description step.

### TC-A09 Description warning modal
- Precondition: `date_warning_popup` is false for the user.
- Steps:
  1. Focus the description textarea.
  2. Interact with the warning modal.
- Expected:
  - Warning modal appears before normal entry.
  - Dismiss/acknowledge behavior works.
  - User can continue typing afterward.

### TC-A10 Review step content
- Steps:
  1. Reach review page.
  2. Verify city, date type, price, duration, description, image.
- Expected:
  - Review reflects saved inputs.
  - Image shown is valid.
  - Edit button is visible.
  - Post button is visible.

### TC-A11 Post date
- Steps:
  1. Click `Post Date`.
- Expected:
  - Existing draft is published.
  - User returns to user list.
  - Create flow local state is cleared.
  - Newly posted date appears as live.

## B. Draft Flow

### TC-B01 Draft created automatically on description step
- Steps:
  1. Complete city, type, category/aspiration/price, duration.
  2. Enter valid description.
  3. Click `Next`.
- Expected:
  - Draft is saved before review.
  - Review opens successfully.
  - Draft has `date_status=false` until final publish.

### TC-B02 Re-enter create-date with existing draft
- Precondition: Draft exists.
- Steps:
  1. Leave flow before posting.
  2. Re-open create-date entry.
- Expected:
  - User resumes existing draft instead of starting over.
  - No second draft is created.

### TC-B03 Draft values are prefilled
- Steps:
  1. Resume draft.
  2. Visit every step.
- Expected:
  - City, date type, category, aspiration, price, duration, description, image are prefilled.

### TC-B04 Draft back navigation
- Steps:
  1. Resume draft.
  2. Navigate back step-by-step.
- Expected:
  - Back buttons stay inside the draft flow.
  - Browser back does not jump to unrelated screens.

### TC-B05 Draft review edit button
- Steps:
  1. Open draft review.
  2. Click `Edit`.
- Expected:
  - User returns to editable create flow.
  - Query/mode remains draft mode.

### TC-B06 Draft publish does not duplicate
- Precondition: Draft exists.
- Steps:
  1. Publish from review.
  2. Inspect date list/API.
- Expected:
  - Draft record becomes live.
  - No duplicate live date is created.

## C. Existing Live-Date Edit Flow

### TC-C01 Enter edit flow from user profile
- Precondition: At least one live date exists.
- Steps:
  1. Open user profile or date list.
  2. Click edit on a live date.
- Expected:
  - Flow opens in existing-edit mode.
  - User lands on description step or review resume path.

### TC-C02 Existing edit is description-only
- Steps:
  1. Try to access earlier steps while in `new_edit`.
  2. Open date-type, category/price, and duration step URLs manually.
- Expected:
  - User is redirected back to description step.
  - Existing live-date edit does not act like a full create wizard.

### TC-C03 Existing edit prefill
- Steps:
  1. Open live-date edit.
  2. Verify description and preview values.
- Expected:
  - Existing description is prefilled.
  - Duration display label is correct.
  - Selected image remains correct for the existing date.

### TC-C04 Existing edit back navigation
- Steps:
  1. Open live-date edit description step.
  2. Click back.
- Expected:
  - User returns to user profile/list entry point.
  - User is not pushed into duration/date-type pages.

### TC-C05 Existing edit review update
- Steps:
  1. Change description.
  2. Go to review.
  3. Click `Update Date`.
- Expected:
  - Only allowed fields are updated.
  - No new draft or new date is created.
  - User returns to user list/profile with success state.

### TC-C06 Existing edit image behavior
- Steps:
  1. Open existing live-date edit review.
  2. Inspect image section.
- Expected:
  - Existing edit does not expose incorrect draft-style image swapping behavior.
  - Current date image remains stable.

## D. Active Date Limit

### TC-D01 Under limit
- Precondition: 0-3 active dates, no draft.
- Steps:
  1. Start create flow.
- Expected:
  - Flow opens normally.

### TC-D02 At limit with no draft
- Precondition: 4 active dates, no draft.
- Steps:
  1. Start create flow.
- Expected:
  - Limit popup appears.
  - User cannot continue new create flow.

### TC-D03 At limit with draft
- Precondition: 4 active dates and 1 existing draft.
- Steps:
  1. Start create flow.
- Expected:
  - Existing draft can still be resumed.
  - Limit block does not incorrectly hide the draft.

### TC-D04 Limit reached on save
- Precondition: User reaches limit between steps due to another action/session.
- Steps:
  1. Continue create flow.
  2. Save description / attempt preview.
- Expected:
  - User gets clear limit error.
  - Flow redirects safely.
  - No broken half-saved state.

## E. Persistence And Refresh

### TC-E01 Refresh on each step
- Steps:
  1. Refresh on city, type, category/price, duration, description, review.
- Expected:
  - Flow restores safely.
  - No white screen or missing state.

### TC-E02 Close and reopen browser tab
- Steps:
  1. Partially complete flow.
  2. Close tab.
  3. Reopen create flow.
- Expected:
  - Resume path logic is correct.
  - Flow mode remains correct.

### TC-E03 Browser back button
- Steps:
  1. Use browser back on each create-date page.
- Expected:
  - Navigation stays aligned with wizard progression.
  - No mode loss between create, draft-edit, and existing-edit.

## F. API And Data Integrity

### TC-F01 Draft API payload
- Steps:
  1. Save description in new create flow.
  2. Inspect request payload.
- Expected:
  - Payload contains city, province, country, country_code, date type, duration, price, description, image index, `date_status=false`.

### TC-F02 Publish API payload
- Steps:
  1. Post date from review.
  2. Inspect request payload.
- Expected:
  - Payload contains `date_status=true`.
  - Existing draft id is reused when present.

### TC-F03 Existing edit update payload
- Steps:
  1. Update a live date.
  2. Inspect request payload.
- Expected:
  - Payload updates the targeted `date_id`.
  - No create endpoint is used for live-date edit unless explicitly intended.

### TC-F04 Unauthorized response handling
- Steps:
  1. Expire/remove auth token during flow.
  2. Attempt next action.
- Expected:
  - User is logged out or redirected safely.
  - No endless spinner.

## G. Regression Cases From Current Refactor

### TC-G01 Review Edit preserves mode
- Steps:
  1. Open review in draft mode.
  2. Click `Edit`.
  3. Repeat in existing-edit mode.
- Expected:
  - Draft review returns to draft flow.
  - Existing-edit review returns to existing-edit description step.
  - Query/mode is not lost.

### TC-G02 Existing-edit cannot drift into create flow
- Steps:
  1. Start editing a live date.
  2. Use direct URLs and back buttons aggressively.
- Expected:
  - User never ends up in create/draft-only steps as an editable path.

### TC-G03 Duration display mapping
- Precondition: Existing live date has stored backend value `1/2H`, `1H`, `2H`, or `3H`.
- Steps:
  1. Open edit flow.
  2. Inspect preview.
- Expected:
  - Display shows correct human label.
  - No blank or wrong preselection.

### TC-G04 No duplicate draft on repeated preview entry
- Steps:
  1. Reach description.
  2. Go to review.
  3. Go back to description.
  4. Change text.
  5. Go to review again.
- Expected:
  - Same draft is updated.
  - No duplicate draft records.

## H. Mobile And Responsive

### TC-H01 iPhone Safari flow
- Steps:
  1. Run full create flow on mobile Safari.
- Expected:
  - Sticky header and bottom CTA do not block content.
  - Keyboard does not break textarea step.

### TC-H02 Android Chrome flow
- Steps:
  1. Run full create flow on Android Chrome.
- Expected:
  - Same as iPhone.
  - Geolocation and dropdown interactions work.

### TC-H03 Mobile browser back
- Steps:
  1. Use device/browser back gestures on each step.
- Expected:
  - Flow remains stable.

## I. Cleanup Checks

### TC-I01 State cleared after successful post
- Steps:
  1. Post a date successfully.
  2. Re-enter create flow.
- Expected:
  - Old draft/local state is gone.
  - Flow starts fresh unless another draft exists.

### TC-I02 State cleared after successful live-date update
- Steps:
  1. Update existing live date.
  2. Re-enter create flow.
- Expected:
  - Existing-edit state does not leak into create flow.

## Suggested Execution Order

1. TC-A01 to TC-A11
2. TC-B01 to TC-B06
3. TC-C01 to TC-C06
4. TC-D01 to TC-D04
5. TC-E01 to TC-E03
6. TC-F01 to TC-F04
7. TC-G01 to TC-G04
8. TC-H01 to TC-H03
9. TC-I01 to TC-I02

## Exit Criteria

- No duplicate drafts
- No duplicate live dates after publish
- Existing live-date edit remains description-only
- Draft resume is deterministic
- Back navigation is stable
- Review edit preserves correct mode
- Active-date limit behavior is correct
