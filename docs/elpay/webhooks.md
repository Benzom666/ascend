# Webhooks

# Webhook Notifications

When a payment status changes, the system POSTs a JSON body to the `webhook_url`
you provided when creating the payment.

## Payload Structure

```json
{
  "id": "w9c1d2e3-f4a5-6789-bcde-f01234567890",
  "type": "PAYMENT",
  "event": "payment.complete",
  "payment": {
    "payment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "payment_num": "1",
    "status": "COMPLETED",
    "status_name": "Completed",
    "request_amount": 4999,
    "request_amount_fmt": "49.99",
    "amount": 4849,
    "amount_fmt": "48.49",
    "asset_id": "USD",
    "currency": "USD",
    "custom": "order-1042",
    "buyer_email": "jane.smith@example.com",
    "complete_date": "2024-01-15T10:32:17Z"
  }
}
```

| Field | Description |
|---|---|
| `id` | Unique delivery identifier for this notification |
| `type` | Always `PAYMENT` for payment events |
| `event` | Event name (see table below) |
| `payment` | Full payment object — same fields as `GET /payment/{paymentId}` |

## Events

| Event | Trigger |
|---|---|
| `payment.created` | Payment was created and is waiting for the payer to start checkout. |
| `payment.in_progress` | Payment request is being processed. |
| `payment.closing` | Payment is in a short transitional closing step before final status. |
| `payment.completed` | Payment finished successfully. |
| `payment.canceled` | Payment was canceled or expired before completion. |


## Signature Header

To help you verify that a webhook really came from ElPay, we can sign each request.

If your store has a webhook secret configured, webhook requests include this header:

- `X-Webhook-HMAC-SHA512`

The header value is an HMAC-SHA512 signature of the **raw request body** using your webhook secret.

## Responding to Webhooks

Your endpoint must return **HTTP 200** quickly (within a few seconds).
If your server returns a non-2xx status or times out, delivery will be retried
automatically with backoff.

**Do not** perform slow operations (database writes, emails, downstream API calls)
before responding — acknowledge immediately and process asynchronously.

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/webhooks/payment")
def payment_webhook():
    body = request.get_json()

    event    = body.get("event")
    payment  = body.get("payment", {})
    order_id = payment.get("custom")   # your own reference

    if event == "payment.complete":
        # queue fulfillment — do NOT block here
        pass

    return jsonify({"ok": True}), 200
```



