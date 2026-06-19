# Payments

# Payments

Reference for creating and retrieving payments.

## Important Amount Note

Please double-check this field before going live: `amount` is in cents (minor units), not dollars/euros.

Examples:
- If you want to charge `$55.00`, send `5500`
- If you want to charge `$10.00`, send `1000`

If you send major units by mistake, the customer can be charged 100x more than intended.

## Idempotency

Every `POST /payment` request requires an `idempotency_key` — your own unique
identifier for the payment (UUID).

```
idempotency_key max length: 100 characters
```

If the network drops after you send the request but before you receive a
response, retry with the **same** `idempotency_key`. The API returns the
existing payment instead of creating a duplicate.
Friendly tip: an `idempotency_key` stays active for 24 hours.  

## Supported Currencies

| `asset_id` | Currency        |
| ---------- | --------------- |
| `USD`      | US Dollar       |
| `EUR`      | Euro            |
| `GBP`      | British Pound   |
| `CAD`      | Canadian Dollar |

Call `GET /assets` to get the full list with per-asset limits and fee information
for your store.

## Payer Fields

The `payer_*` fields let you pre-populate the checkout form and improve
conversion. Only `payer_email` , `payer_country` and `payer_lang` are required.

| Field              | Required | Notes                                                                                          |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `payer_email`      | **Yes**  | Used for receipts and fraud checks                                                             |
| `payer_country`    | **Yes**  | ISO 3166-1 alpha-2 (e.g. `US`, `GB`, `DE`)                                                     |
| `payer_first_name` | No       | Pre-fills the checkout form                                                                    |
| `payer_last_name`  | No       | Pre-fills the checkout form                                                                    |
| `payer_phone`      | No       | International format recommended (e.g. `+12025550147`)                                         |
| `payer_address`    | No       | Required by some card networks for AVS checks                                                  |
| `payer_city`       | No       | Required by some card networks for AVS checks                                                   |
| `payer_state`      | No       | Required by some card networks for AVS checks                                                   |
| `payer_zip`        | No       | Required by some card networks for AVS checks                                                  |
| `payer_birth_date` | No       | Format: `YYYY-MM-DD`                                                                           |
| `payer_lang`       | **Yes**  | Checkout page language (`en`, `es`, `fr`,`pt`,`tr`,`ar`,`fa`,`ja`,`zh`,`ru`). Defaults to `en` |

## Custom Fields

Ten custom string fields (`custom`, `custom1`–`custom9`) are passed through
unchanged to webhook notifications and payment detail responses.

Use them to attach your own metadata — order IDs, user IDs, product codes, etc.

```json
{
  "custom": "order-1042",
  "custom1": "user-8801",
  "custom2": "product-premium"
}
```

## Test Mode

Want to run payments safely in sandbox mode? Use a **test store**.

How it works:
- Create (or enable) a test store in Merchant Portal
- Use that store's API key and secret for your API calls
- Every payment created there is automatically a test payment (`"is_test": true`)

Test payments go through a sandbox PSP and never charge real cards.

Use test mode during integration to verify your webhook handling and order
fulfillment logic before going live.

