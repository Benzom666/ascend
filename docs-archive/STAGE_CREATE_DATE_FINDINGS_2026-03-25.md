# Women's Create Date Flow Findings

Date: 2026-03-25
Target: `https://lesociety-stage.vercel.app`
Accounts used:
- `afro@yopmail.com / 123456`
- `mia23@yopmail.com / 123456`
- `bella29@yopmail.com / 123456`

## Confirmed Defects

### 1. Earnings Step does not carry expected female aspiration/category state
- Severity: High
- Related cases: `TC-A05`, `TC-B03`, `TC-B01`, `TC-B02`
- Account used: `mia23@yopmail.com`
- Observed behavior:
  - In `/create-date/date-event`, the page loads with `Select A Category` instead of a usable prefilled category/aspiration state.
  - After choosing a price only, `NEXT` stays disabled.
  - The flow only becomes movable if category and aspiration are manually set first.
- Why this is wrong:
  - The expected baseline says category, aspiration, and price should persist together.
  - For these female test accounts, the create flow should not stall at earnings because of missing prefill/state.
- Impact:
  - New create flow is blocked for affected users.
  - Draft/resume and publish/limit scenarios cannot be completed through the intended normal click path.

### 2. Review step is reachable with incomplete wizard state
- Severity: High
- Related cases: `TC-A10`, `TC-E01`, general step-gating
- Account used: `afro@yopmail.com`
- Observed behavior:
  - Direct navigation to `/create-date/review` renders the review screen even when the create flow was not completed through prior steps.
  - The review UI showed incomplete/blank date details while still exposing `EDIT` and `POST DATE`.
- Why this is wrong:
  - Review should reflect saved draft/create inputs and should not be reachable in a broken partial state.
- Impact:
  - Users can land on a misleading preview page with missing data.
  - Step restoration/gating is not strict enough.

## Confirmed Working

### Existing live-date edit flow
- Account used: `bella29@yopmail.com`
- Verified:
  - `/create-date/choose-date-type?new_edit=true` redirects to `/create-date/description?new_edit=true`
  - `/create-date/date-event?new_edit=true` redirects to `/create-date/description?new_edit=true`
  - `/create-date/duration?new_edit=true` redirects to `/create-date/description?new_edit=true`
  - Existing description is prefilled
  - Review page in `new_edit` mode does not show `Swap Image`
  - Review page shows `Update Date`
  - Update uses `POST /api/v1/date/update`
  - Request payload targets the existing `date_id`
  - The same live record is updated instead of creating a new one
- Evidence from live run:
  - `date_id`: `69c31c4a56c7e1b33c51a6a3`
  - Update payload:
    - `user_name: bella`
    - `date_id: 69c31c4a56c7e1b33c51a6a3`
    - `date_details: Updated through existing-edit flow in live testing. The description changed, but the date should remain the same record.`

## Execution Notes

- All three accounts logged in successfully on stage.
- The create-date wizard routes are live on stage.
- I was able to verify the existing-edit path end-to-end.
- I was not able to complete a clean end-to-end new create/publish cycle through the intended normal UI path because the earnings-step state issue blocked forward progress unless category/aspiration were manually forced first.

