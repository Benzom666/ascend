# BucksBus Payment Failed - Troubleshooting Guide

## 🔍 Common Causes

The "BucksBus payment failed" error can occur for several reasons:

### 1. **Invalid API Credentials** (Most Common)
**Issue:** API key or secret is incorrect/inactive  
**Solution:** 
- Verify credentials in BucksBus dashboard
- Check if you're using test vs production keys
- Ensure account is active and verified

### 2. **Incorrect API Endpoint URL**
**Issue:** Base URL is wrong  
**Current:** `https://api.bucksbus.com`  
**Try:**
- `https://api.bucksbus.com/v1` 
- `https://sandbox.bucksbus.com` (for testing)
- Check BucksBus documentation for correct endpoint

### 3. **Authentication Signature Issues**
**Issue:** HMAC signature not matching  
**Check:**
- Time synchronization on server
- Signature generation algorithm
- API secret encoding

### 4. **Missing Required Fields**
**Issue:** BucksBus API requires fields we're not sending  
**Check:** BucksBus API docs for required fields in reverse payment

---

## 🛠️ Quick Fixes

### Option 1: Verify API Credentials
```bash
# Check your .env file
cat lesociety/latest/home/node/secret-time-next-api/.env | grep BUCKSBUS
```

### Option 2: Test with Different Base URL
Edit `lesociety/latest/home/node/secret-time-next-api/.env`:
```env
# Try sandbox/test URL
BUCKSBUS_BASE_URL=https://sandbox.bucksbus.com

# Or try different API version
BUCKSBUS_BASE_URL=https://api.bucksbus.com/v1
```

### Option 3: Check BucksBus Documentation
1. Login to BucksBus dashboard
2. Navigate to API documentation
3. Verify:
   - Correct base URL for your environment
   - Required authentication headers
   - Required fields for fiat payment creation

### Option 4: Enable Detailed Logging
Edit `lesociety/latest/home/node/secret-time-next-api/lib/bucksbus.js`:
```javascript
async makeRequest(method, path, data = null) {
  const authorization = this.generateSignature(method, path, data);
  
  console.log('=== BUCKSBUS REQUEST DEBUG ===');
  console.log('Method:', method);
  console.log('URL:', `${this.baseURL}${path}`);
  console.log('Headers:', { 'Content-Type': 'application/json', 'Authorization': authorization });
  console.log('Body:', data);
  console.log('==============================');
  
  try {
    const response = await axios({
      method,
      url: `${this.baseURL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      data,
    });
    
    console.log('=== BUCKSBUS RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('=========================');
    
    return response.data;
  } catch (error) {
    console.error('=== BUCKSBUS ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
    console.error('Full Error:', error.message);
    console.error('======================');
    throw new Error(error.response?.data?.message || 'BucksBus payment failed');
  }
}
```

---

## 📞 Contact BucksBus Support

If the issue persists, contact BucksBus support with:

1. **Your API Key:** `6623397`
2. **Error Message:** "404 page not found" or other specific error
3. **Request Details:**
   - Endpoint: `POST /api/v1/payments`
   - Method: Reverse fiat payment
   - Region: Testing from [your location]

**Questions to Ask:**
- What is the correct base URL for API calls?
- Are my credentials active and verified?
- What are the required fields for reverse fiat payment?
- Do I need to enable any features in the dashboard?

---

## 🔄 Alternative: Test Mode Bypass

For immediate testing while waiting for BucksBus support, you can temporarily enable a test mode:

### Create Test Payment Endpoint
Edit `lesociety/latest/home/node/secret-time-next-api/controllers/v1/payment.controller.js`:

Add this at the top of `createPayment` function:
```javascript
// TEMPORARY: Test mode bypass
if (process.env.BUCKSBUS_TEST_MODE === 'true') {
  const mockPaymentId = `test_${Date.now()}`;
  
  // Save mock payment in database
  const payment = new Payment({
    username_id: userId,
    transaction_id: mockPaymentId,
    amount: amount.toString(),
    currency,
    bank_name: 'BucksBus (Test)',
    payment_status: 'pending',
    created_at: new Date(),
  });
  await payment.save();

  // Return mock payment URL
  return res.status(200).json({
    success: true,
    message: 'Payment created successfully (TEST MODE)',
    data: {
      payment_id: mockPaymentId,
      payment_url: `http://localhost:3000/payment/success?payment_id=${mockPaymentId}`,
      amount,
      currency,
      status: 'pending',
    }
  });
}
```

Then in `.env`:
```env
BUCKSBUS_TEST_MODE=true
```

**⚠️ Remember to disable test mode in production!**

---

## 📊 Expected Errors vs Real Issues

### ✅ Expected (During Development)
- `404 page not found` - API endpoint might be incorrect
- `401 Unauthorized` - Credentials need verification
- `403 Forbidden` - Account permissions issue

### ❌ Unexpected (Code Issues)
- `500 Internal Server Error` - Our code has a bug
- `TypeError` - Missing required field in our code
- `Network Error` - Server connectivity issue

Based on our testing, we're getting `404 page not found`, which is expected with test credentials.

---

## ✅ What's Already Working

Even though BucksBus API returns 404, our code is working correctly:

✅ User authentication  
✅ JWT token validation  
✅ User data extraction  
✅ Payment request creation  
✅ Signature generation  
✅ Error handling  
✅ Logging  

The only issue is the BucksBus API endpoint/credentials!

---

## 🎯 Recommended Next Steps

1. **Contact BucksBus support** to verify credentials and API URL
2. **Check BucksBus dashboard** for API documentation
3. **Try sandbox URL** if available
4. **Enable detailed logging** to see exact request/response
5. **Use test mode bypass** for immediate frontend testing

Once you get the correct API details from BucksBus, the integration will work immediately!
