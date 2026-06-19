# Errors

# Errors & Best Practices

## Error Format

All errors return a JSON body with a machine-readable `code`:

```json
{
  "code": "ERR_VALIDATION",
  "message": "Validation failed",
  "fields": [
    { "field": "payer_email", "message": "Invalid email address" }
  ]
}
```

The `fields` array is only present for `ERR_VALIDATION` responses and lists every
field that failed.

## HTTP Status Codes

| Status | Meaning |
|---|---|
| `200` | Success |
| `401` | Missing or invalid API credentials |
| `422` | Validation failure or business rule violation — inspect `code` and `fields` |
| `503` | Service temporarily unavailable — retry with exponential backoff |

## Error Codes

| `code` | Cause |
|---|---|
| `ERR_VALIDATION` | One or more request fields failed validation |
| `ERR_IDEMPOTENCY_KEY_REQUIRED` | `idempotency_key` is missing |
| `ERR_WRONG_IDEMPOTENCY_KEY` | `idempotency_key` exceeds 100 characters |
| `ERR_WRONG_PAYMENT_METHOD` | `method` is not `CARD` |
| `ERR_WRONG_PAYMENT_AMOUNT` | `amount` must be greater than 0 |
| `ERR_PAYMENT_ASSET_REQUIRED` | `asset_id` is missing |
| `ERR_WRONG_PAYMENT_ASSET` | `asset_id` is not a supported currency |
| `ERR_PAYMENT_EMAIL_REQUIRED` | `payer_email` is missing |
| `ERR_WRONG_PAYMENT_EMAIL` | `payer_email` is not a valid email address |
| `ERR_PAYMENT_COUNTRY_REQUIRED` | `payer_country` is missing |
| `ERR_WRONG_PAYMENT_COUNTRY` | `payer_country` is not a valid ISO 3166-1 alpha-2 code |
| `ERR_OUT_OF_SERVICE` | The organization is temporarily disabled |

## Best Practices

**Retry with backoff on 503**
Start with a 1-second delay and double it on each retry, up to a maximum of
60 seconds. Do not hammer the API with rapid retries.

**Prefer webhooks over polling**
Polling more than once every 5 seconds per payment puts unnecessary load on
the API and increases your response latency. Set a `webhook_url` instead.

**Store `payment_id` immediately**
Persist the `payment_id` from the `POST /payment` response alongside your order
record before redirecting the customer. You'll need it to reconcile webhook
events and handle retries safely.

**Use idempotency keys**
Always pass a stable `idempotency_key` tied to your order. If a request fails
mid-flight, retrying with the same key is safe and won't double-charge.

**Set a meaningful description**
The `description` field is displayed to the customer on the payment page and
may appear in their bank statement — keep it clear and recognisable.

