# Quick Start

# Quick Start: Create and Complete a Payment

This guide walks you through the full payment flow in 4 steps.

## Step 1 — Discover available currencies

Call `GET /assets` to see which currencies your store can process and their limits.

```bash
curl https://api.elpay.online/int/assets \
  -u "100042:550e8400-e29b-41d4-a716-446655440000"
```

Each object in the response has an `asset_id` (e.g. `USD`, `EUR`) you'll use in
the next step.

## Step 2 — Create a payment

```bash
curl -X POST https://api.elpay.online/int/payment \
  -u "100042:550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "idempotency_key": "e20cba58-85f9-4cb3-b9e6-746818fcf7e9",
    "amount": 4999,
    "asset_id": "USD",
    "description": "Order #1042 — Premium subscription",
    "payer_email": "jane.smith@example.com",
    "webhook_url": "https://yourshop.com/webhooks/payment",
    "success_url": "https://yourshop.com/order/1042/success",
    "cancel_url": "https://yourshop.com/order/1042/cancel",
    "custom": "order-1042"
  }'
```

**Response:**

```json
{
  "payment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payment_num": "1",
  "is_test": false,
  "status": "CREATED",
  "start_date": "2024-01-15T10:30:00Z",
  "end_date": "2024-01-15T10:45:00Z",
  "payment_url": "https://elpay.checkout/payment/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Save the `payment_id`** alongside your order record right away — you'll need it
to reconcile webhook events and for status polling.

## Step 3 — Redirect your customer

Send the customer to `payment_url`. They'll see the hosted checkout page, enter
their card details, and complete (or cancel) the payment. The page is valid
until `end_date`.

## Step 4 — Receive the result

There are two ways to get the outcome:

| Method | When to use |
|---|---|
| **Webhook** (recommended) | Near real-time, push-based. Set `webhook_url` at creation. |
| **Polling** | Useful for testing or when you can't expose a public URL. |

### Option A — Webhooks

Set `webhook_url` in the creation request and handle the POST notification.
See the [Webhooks](./webhooks.md) page for payload details and a handler example.

### Option B — Polling

```bash
curl https://api.elpay.online/int/payment/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -u "100042:550e8400-e29b-41d4-a716-446655440000"
```

Check the `status` field:

| Status | Meaning |
|---|---|
| `CREATED` | Payment was created and is waiting for the payer to start checkout. |
| `IN_PROGRESS` | Payment request is being processed. |
| `CLOSING` | Payment is in a short transitional closing step before final status. |
| `COMPLETED` | Payment finished successfully.  |
| `CANCELED` | Payment was canceled or expired before completion. |

> Poll no more than once every 5 seconds per payment.

