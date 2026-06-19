# 📚 API Documentation - Le Society

**Last Updated:** April 4, 2026  
**Version:** 2.0  
**Base URL:** `http://localhost:3001/api/v1` (Development)

---

## 📋 TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [User Endpoints](#user-endpoints)
3. [Date Endpoints](#date-endpoints)
4. [Chat Endpoints](#chat-endpoints)
5. [Payment Endpoints](#payment-endpoints)
6. [Notification Endpoints](#notification-endpoints)
7. [Admin Endpoints](#admin-endpoints)
8. [Error Handling](#error-handling)

---

## AUTHENTICATION

### JWT Token Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Token Lifetime

- Access Token: 24 hours
- Refresh Token: 7 days

---

## USER ENDPOINTS

### 1. User Registration (Signup)

**Step 1: Initial Signup**

```http
POST /api/v1/user/signup
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "gender": "male",
  "dob": "1990-01-01",
  "location": "London, UK",
  "username": "johndoe"
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "User created successfully",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "step": 1
  }
}
```

**Step 2: Upload Images**

```http
POST /api/v1/user/signup/step2
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "profile_image": "https://storage.url/image1.jpg",
  "images": [
    "https://storage.url/image2.jpg",
    "https://storage.url/image3.jpg"
  ]
}
```

**Step 3: Profile Details**

```http
POST /api/v1/user/signup/step3
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "tagline": "Adventure seeker and foodie",
  "description": "I love traveling and trying new cuisines..."
}
```

**Step 4: Additional Info**

```http
POST /api/v1/user/signup/step4
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "height": "175",
  "occupation": "Software Engineer",
  "education": "Bachelor's Degree"
}
```

---

### 2. User Login

```http
POST /api/v1/user/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "gender": "male",
      "profile_image": "https://storage.url/profile.jpg",
      "status": 1,
      "verification_status": 2,
      "tokens": 50
    }
  }
}
```

**Error Response (401):**

```json
{
  "status": 401,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User (Me)

```http
GET /api/v1/user/me
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "gender": "male",
    "tokens": 50,
    "profile_image": "https://storage.url/profile.jpg",
    "images": ["https://storage.url/img1.jpg"],
    "location": "London, UK",
    "verification_status": 2,
    "created_at": "2026-04-01T10:00:00.000Z"
  }
}
```

---

### 4. Get User Profile

```http
GET /api/v1/user/profile-info?user_id=507f1f77bcf86cd799439011
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Smith",
    "tagline": "Life is an adventure",
    "description": "Love traveling and meeting new people",
    "profile_image": "https://storage.url/profile.jpg",
    "images": ["https://storage.url/img1.jpg"],
    "location": "London, UK",
    "age": 28,
    "verification_status": 2
  }
}
```

---

### 5. Get All Users (Admin/Browse)

```http
GET /api/v1/user?page=1&limit=20&gender=female&status=1
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `gender` - Filter by gender (male/female)
- `status` - Filter by status (1=active, 0=inactive)
- `location` - Filter by location
- `verification_status` - Filter by verification (0,1,2,3)

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Jane Smith",
        "profile_image": "https://storage.url/profile.jpg",
        "location": "London, UK",
        "age": 28,
        "verification_status": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_users": 98,
      "per_page": 20
    }
  }
}
```

---

### 6. Update User Tokens

```http
POST /api/v1/user/update-tokens
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "tokens": 100,
  "action": "add"
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Tokens updated successfully",
  "data": {
    "tokens": 150
  }
}
```

---

### 7. Password Reset

**Request Reset:**

```http
POST /api/v1/user/forget-password
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Password reset email sent"
}
```

**Reset Password:**

```http
POST /api/v1/user/reset-password
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123"
}
```

---

## DATE ENDPOINTS

### 1. Create Date

```http
POST /api/v1/date
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "location": "Covent Garden, London",
  "date_time": "2026-04-10T19:00:00.000Z",
  "duration": "2-3 hours",
  "category": "Dinner & Drinks",
  "experience_type": "Fine Dining",
  "description": "Looking for someone to join me for dinner at a Michelin star restaurant",
  "earning_expectation": "£200-£300",
  "images": ["https://storage.url/date1.jpg"],
  "age_preference": {
    "min": 25,
    "max": 45
  }
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Date created successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "user_id": "507f1f77bcf86cd799439011",
    "location": "Covent Garden, London",
    "date_time": "2026-04-10T19:00:00.000Z",
    "status": 0,
    "created_at": "2026-04-04T15:42:00.000Z"
  }
}
```

---

### 2. Get All Dates (Browse)

```http
GET /api/v1/date?page=1&limit=20&location=London&status=1
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` - Page number
- `limit` - Results per page
- `location` - Filter by location
- `status` - Filter by status (0=pending, 1=approved, 2=rejected)
- `category` - Filter by category
- `date_from` - Filter dates after this date
- `date_to` - Filter dates before this date

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "dates": [
      {
        "_id": "507f191e810c19729de860ea",
        "user": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Jane Smith",
          "profile_image": "https://storage.url/profile.jpg",
          "verification_status": 2
        },
        "location": "Covent Garden, London",
        "date_time": "2026-04-10T19:00:00.000Z",
        "duration": "2-3 hours",
        "category": "Dinner & Drinks",
        "description": "Looking for someone to join...",
        "images": ["https://storage.url/date1.jpg"],
        "status": 1,
        "created_at": "2026-04-04T15:42:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_dates": 45,
      "per_page": 20
    }
  }
}
```

---

### 3. Get Date by ID

```http
GET /api/v1/date/507f191e810c19729de860ea
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Smith",
      "profile_image": "https://storage.url/profile.jpg",
      "location": "London, UK",
      "verification_status": 2
    },
    "location": "Covent Garden, London",
    "date_time": "2026-04-10T19:00:00.000Z",
    "duration": "2-3 hours",
    "category": "Dinner & Drinks",
    "description": "Looking for someone to join me...",
    "earning_expectation": "£200-£300",
    "images": ["https://storage.url/date1.jpg"],
    "status": 1
  }
}
```

---

### 4. Update Date

```http
POST /api/v1/date/update
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "date_id": "507f191e810c19729de860ea",
  "location": "Updated Location",
  "description": "Updated description..."
}
```

---

### 5. Delete Date

```http
DELETE /api/v1/date?date_id=507f191e810c19729de860ea
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Date deleted successfully"
}
```

---

### 6. Get Date Statistics

```http
GET /api/v1/date/stats
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "total_dates": 150,
    "pending_dates": 12,
    "approved_dates": 120,
    "rejected_dates": 18,
    "my_dates": 5,
    "my_active_dates": 3
  }
}
```

---

## CHAT ENDPOINTS

### 1. Send Chat Request

```http
POST /api/v1/chat/request
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "receiver_id": "507f1f77bcf86cd799439011",
  "date_id": "507f191e810c19729de860ea",
  "message": "Hi! I'd love to join you for dinner."
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Chat request sent",
  "data": {
    "room_id": "608f1f77bcf86cd799439099",
    "tokens_deducted": 10,
    "remaining_tokens": 40
  }
}
```

---

### 2. Accept Chat Request

```http
POST /api/v1/chat/accept
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "room_id": "608f1f77bcf86cd799439099"
}
```

---

### 3. Reject Chat Request

```http
POST /api/v1/chat/reject
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "room_id": "608f1f77bcf86cd799439099",
  "reason": "Not interested"
}
```

---

### 4. Get Chat Room List

```http
GET /api/v1/chat/chatroom-list?page=1&limit=20
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "chatrooms": [
      {
        "_id": "608f1f77bcf86cd799439099",
        "partner": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Jane Smith",
          "profile_image": "https://storage.url/profile.jpg"
        },
        "last_message": {
          "message": "Looking forward to meeting you!",
          "created_at": "2026-04-04T14:30:00.000Z"
        },
        "unread_count": 2,
        "is_active": true,
        "updated_at": "2026-04-04T14:30:00.000Z"
      }
    ],
    "total": 5
  }
}
```

---

### 5. Get Chat History

```http
GET /api/v1/chat/chatroom-history?room_id=608f1f77bcf86cd799439099&page=1&limit=50
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "messages": [
      {
        "_id": "608f2a77bcf86cd7994390aa",
        "room_id": "608f1f77bcf86cd799439099",
        "sender_id": "507f1f77bcf86cd799439012",
        "receiver_id": "507f1f77bcf86cd799439011",
        "message": "Hi! How are you?",
        "is_read": true,
        "created_at": "2026-04-04T14:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_messages": 75
    }
  }
}
```

---

### 6. Block User

```http
POST /api/v1/chat/block
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "room_id": "608f1f77bcf86cd799439099"
}
```

---

## PAYMENT ENDPOINTS

### 1. Create Payment

```http
POST /api/v1/payment/create
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "amount": 30.00,
  "package": "medium",
  "tokens": 200,
  "provider": "stripe"
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Payment created",
  "data": {
    "payment_id": "708f1f77bcf86cd799439022",
    "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
    "amount": 30.00,
    "tokens": 200
  }
}
```

---

### 2. Get Payment Providers

```http
GET /api/v1/payment/providers
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "providers": [
      {
        "id": "stripe",
        "name": "Credit/Debit Card",
        "enabled": true
      },
      {
        "id": "paypal",
        "name": "PayPal",
        "enabled": true
      },
      {
        "id": "bucksbus",
        "name": "Bank Transfer",
        "enabled": true
      }
    ]
  }
}
```

---

### 3. Get Payment Details

```http
GET /api/v1/payment/708f1f77bcf86cd799439022
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "_id": "708f1f77bcf86cd799439022",
    "user_id": "507f1f77bcf86cd799439011",
    "amount": 30.00,
    "tokens": 200,
    "status": "completed",
    "provider": "stripe",
    "transaction_id": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "created_at": "2026-04-04T15:00:00.000Z"
  }
}
```

---

## NOTIFICATION ENDPOINTS

### 1. Get All Notifications

```http
GET /api/v1/notification?page=1&limit=20
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "notifications": [
      {
        "_id": "808f1f77bcf86cd799439033",
        "user_id": "507f1f77bcf86cd799439011",
        "type": "chat_request",
        "title": "New Chat Request",
        "message": "John Doe wants to chat with you",
        "data": {
          "room_id": "608f1f77bcf86cd799439099",
          "sender_id": "507f1f77bcf86cd799439012"
        },
        "is_read": false,
        "created_at": "2026-04-04T14:00:00.000Z"
      }
    ],
    "unread_count": 5,
    "total": 25
  }
}
```

---

### 2. Mark Notification as Read

```http
PUT /api/v1/notification
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "notification_id": "808f1f77bcf86cd799439033"
}
```

---

### 3. Mark All as Read

```http
PUT /api/v1/notification/read-all-notification
Authorization: Bearer <token>
```

---

## ADMIN ENDPOINTS

### 1. Update User Status

```http
POST /api/v1/user/update-status
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "status": 1,
  "verification_status": 2,
  "profile_status": 1
}
```

**Status Values:**
- `status`: 0=inactive, 1=active
- `verification_status`: 0=pending, 1=in_review, 2=approved, 3=rejected
- `profile_status`: 0=incomplete, 1=complete

---

### 2. Request More Info

```http
POST /api/v1/user/request-info
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "message": "Please upload a clearer profile photo"
}
```

---

### 3. Update Date Status

```http
POST /api/v1/date/update-status
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "date_id": "507f191e810c19729de860ea",
  "status": 1,
  "admin_note": "Approved"
}
```

**Status Values:**
- 0 = Pending review
- 1 = Approved
- 2 = Rejected
- 3 = Warning (needs changes)

---

### 4. Dashboard Statistics

```http
GET /api/v1/dashboard/total-users
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
{
  "status": 200,
  "data": {
    "total_users": 500,
    "male_users": 300,
    "female_users": 200,
    "verified_users": 350,
    "pending_verification": 50
  }
}
```

---

## ERROR HANDLING

### Standard Error Response Format

```json
{
  "status": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

### Common Error Messages

**Authentication Errors:**
```json
{
  "status": 401,
  "message": "Invalid or expired token"
}
```

**Validation Errors:**
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

**Insufficient Tokens:**
```json
{
  "status": 400,
  "message": "Insufficient tokens",
  "data": {
    "required": 10,
    "available": 5
  }
}
```

---

## RATE LIMITING

API endpoints are rate-limited to prevent abuse:

- **Public endpoints:** 100 requests per 15 minutes per IP
- **Authenticated endpoints:** 1000 requests per 15 minutes per user
- **Payment endpoints:** 10 requests per minute per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1617981234
```

---

## WEBSOCKET EVENTS (Socket.IO)

### Connection

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'your_jwt_token' }
});
```

### Events

**Join Room:**
```javascript
socket.emit('joinRoom', { room_id: '608f1f77bcf86cd799439099' });
```

**Send Message:**
```javascript
socket.emit('sendMessage', {
  room_id: '608f1f77bcf86cd799439099',
  message: 'Hello!',
  receiver_id: '507f1f77bcf86cd799439011'
});
```

**Receive Message:**
```javascript
socket.on('newMessage', (data) => {
  console.log('New message:', data);
});
```

**Typing Indicator:**
```javascript
socket.emit('typing', { room_id: '608f1f77bcf86cd799439099' });
socket.on('userTyping', (data) => {
  console.log('User is typing:', data);
});
```

---

## TESTING

### Example using cURL

**Login:**
```bash
curl -X POST http://localhost:3001/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

**Get Users:**
```bash
curl -X GET "http://localhost:3001/api/v1/user?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example using JavaScript (Fetch)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3001/api/v1/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: '123456'
    })
  });
  const data = await response.json();
  return data.data.token;
};

// Get users
const getUsers = async (token) => {
  const response = await fetch('http://localhost:3001/api/v1/user?page=1', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

## POSTMAN COLLECTION

Import this URL into Postman for a complete collection:
```
https://api.lesociety.com/postman/collection.json
```

---

**Last Updated:** April 4, 2026  
**Maintained By:** API Team  
**Support:** api-support@lesociety.com
