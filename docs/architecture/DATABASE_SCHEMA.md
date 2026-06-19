# 🗄️ Database Schema - Le Society

MongoDB database structure and collections.

---

## Database: `lesociety`

**Platform:** MongoDB Atlas  
**Collections:** 11

---

## Collections Overview

### 1. users
**Purpose:** User accounts (male and female)

**Key Fields:**
- `_id` - ObjectId
- `name` - String
- `email` - String (unique)
- `password` - String (hashed)
- `gender` - String (male/female)
- `status` - Number (0=inactive, 1=active)
- `verification_status` - Number (0,1,2,3)
- `tokens` - Number
- `profile_image` - String (URL)
- `images` - Array of Strings
- `location` - String
- `created_at` - Date

**Indexes:**
- `email` (unique)
- `status, gender, created_at`
- `location, status`

---

### 2. dates
**Purpose:** Date postings created by female users

**Key Fields:**
- `_id` - ObjectId
- `user_id` - ObjectId (ref: users)
- `location` - String
- `date_time` - Date
- `duration` - String
- `category` - String
- `description` - String
- `earning_expectation` - String
- `status` - Number (0=pending, 1=approved, 2=rejected)
- `images` - Array
- `created_at` - Date

**Indexes:**
- `user_id, status`
- `status, date_time`
- `location, status, date_time`

---

### 3. chatrooms
**Purpose:** Chat room connections between users

**Key Fields:**
- `_id` - ObjectId
- `user_id` - ObjectId (initiator)
- `partner_id` - ObjectId (receiver)
- `date_id` - ObjectId (optional)
- `is_active` - Boolean
- `updated_at` - Date

**Indexes:**
- `user_id, partner_id`
- `user_id, updated_at`

---

### 4. chats
**Purpose:** Individual chat messages

**Key Fields:**
- `_id` - ObjectId
- `room_id` - ObjectId (ref: chatrooms)
- `sender_id` - ObjectId
- `receiver_id` - ObjectId
- `message` - String
- `is_read` - Boolean
- `created_at` - Date

**Indexes:**
- `room_id, created_at`
- `receiver_id, is_read`

---

### 5. notifications
**Purpose:** User notifications

**Key Fields:**
- `_id` - ObjectId
- `user_id` - ObjectId
- `type` - String
- `title` - String
- `message` - String
- `data` - Object
- `is_read` - Boolean
- `created_at` - Date

**Indexes:**
- `user_id, created_at`
- `user_id, is_read`

---

### 6. payments
**Purpose:** Payment transactions

**Key Fields:**
- `_id` - ObjectId
- `user_id` - ObjectId
- `amount` - Number
- `tokens` - Number
- `provider` - String
- `transaction_id` - String
- `status` - String
- `created_at` - Date

**Indexes:**
- `user_id, created_at`
- `transaction_id` (unique, sparse)

---

### 7. categories
**Purpose:** Date categories (static data)

**Fields:**
- `_id` - ObjectId
- `name` - String
- `status` - Number

---

### 8. countries
**Purpose:** Country list (static data)

**Fields:**
- `_id` - ObjectId
- `name` - String
- `code` - String

---

### 9. aspirations
**Purpose:** User aspirations/interests

**Fields:**
- `_id` - ObjectId
- `name` - String
- `status` - Number

---

### 10. promotions
**Purpose:** Promotional offers

**Fields:**
- `_id` - ObjectId
- `title` - String
- `description` - String
- `discount` - Number
- `valid_until` - Date

---

### 11. defaultmessages
**Purpose:** Pre-defined message templates

**Fields:**
- `_id` - ObjectId
- `message` - String
- `type` - String

---

## Status Codes Reference

### User Status
- `0` - Inactive/Pending
- `1` - Active

### Verification Status
- `0` - Not started
- `1` - Pending review
- `2` - Approved
- `3` - Rejected

### Date Status
- `0` - Pending approval
- `1` - Approved
- `2` - Rejected
- `3` - Warning/changes needed

### Payment Status
- `pending` - Payment initiated
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

---

## Relationships

```
users (1) -----> (many) dates
users (1) -----> (many) chatrooms
users (1) -----> (many) payments
users (1) -----> (many) notifications

chatrooms (1) -> (many) chats
dates (1) ------> (1) chatrooms (optional)
```

---

**See also:** [Database Optimization Guide](../guides/DATABASE_OPTIMIZATION.md)
