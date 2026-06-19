# Email to BucksBus Support

---

**Subject:** API Integration Help - Getting 404 Error with Reverse Fiat Payment

---

**Email Body:**

Hi BucksBus Support Team,

I'm integrating your payment gateway into my application (Le Society) and need help with the API setup. I'm getting a `404 page not found` error when trying to create payments.

## My Credentials
- **API Key:** 6623397
- **API Secret:** b75a9e0f6cf64eb1871159f99038719f

## Current API Call
I'm making the following request:

```
POST https://api.bucksbus.com/api/v1/payments
Authorization: 6623397:<timestamp>:<hmac-sha256-signature>
Content-Type: application/json

{
  "amount": "30.00",
  "currency": "USD",
  "description": "Le Society Token Purchase",
  "email": "user@example.com",
  "reverse": {
    "type": "fiat",
    "country": "CA",
    "state": "ON"
  },
  "provider": "transak",
  "metadata": {
    "user_id": "...",
    "interested_tokens": "10",
    "super_interested_tokens": "5"
  },
  "webhook_url": "https://lesociety.com/api/v1/payment/bucksbus-webhook",
  "success_url": "https://lesociety.com/payment/success",
  "cancel_url": "https://lesociety.com/payment/cancel"
}
```

## Error Response
```
404 page not found
```

## Questions

1. **Is the API base URL correct?**
   - Currently using: `https://api.bucksbus.com`
   - Should I use a different URL (sandbox/test environment)?

2. **Are my API credentials active and verified?**
   - API Key: 6623397
   - Do I need to activate/verify my account first?

3. **Is the endpoint path correct?**
   - Currently using: `POST /api/v1/payments`
   - Should it be different? (e.g., `/v1/payments`, `/api/payments`)

4. **Provider Parameter:**
   - Can I specify `"provider": "transak"` to redirect directly to Transak?
   - Or do I need to use a different field/format?
   - What providers are available? (Transak, MoonPay, Ramp?)

5. **Authentication:**
   - Is my HMAC signature format correct?
   - Format: `API_KEY:TIMESTAMP:HMAC_SHA256(method+path+timestamp+body)`

## What I'm Trying to Achieve

I want to create reverse fiat payments where:
- User pays in USD/fiat currency
- We receive crypto
- User is redirected DIRECTLY to a provider (Transak/MoonPay) with pre-filled data
- No BucksBus intermediary selection page

## Integration Details
- **Use Case:** Token purchases for dating app
- **Payment Amounts:** $25-$100 USD
- **Expected Volume:** 100-500 transactions/month initially
- **User Regions:** Primarily USA and Canada

## Documentation Review

I've reviewed these docs from your site:
- Create Fiat Payment: https://docs.bucksbus.com/create-fiat-payment-18549072e0.md
- Reverse Schema: https://docs.bucksbus.com/reverse-11777568d0.md
- Providers Schema: https://docs.bucksbus.com/providers-11102060d0.md

But I'm still getting 404 errors. Any guidance would be greatly appreciated!

## Request

Could you please:
1. Verify my API credentials are active
2. Provide the correct API endpoint URL
3. Confirm the request format is correct
4. Share example request/response for reverse fiat payments
5. Confirm provider parameter support

Thank you for your help!

Best regards,
[Your Name]
Le Society
[Your Email]

---

## Alternative Support Channels

If email doesn't work, try:
1. **BucksBus Dashboard:** Login and check for support/chat
2. **Documentation:** Check for updated API docs
3. **Discord/Slack:** If they have a developer community
4. **Twitter:** @bucksbus or similar

---

## What to Expect

BucksBus support should respond with:
1. ✅ Correct API base URL
2. ✅ Confirmation of credential activation
3. ✅ Example working request
4. ✅ Provider parameter documentation
5. ✅ Any required account setup steps

Once you get this info, I can update the integration immediately!
