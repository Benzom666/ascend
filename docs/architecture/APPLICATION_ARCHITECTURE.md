# Le Society - Complete Application Architecture & Analysis

**Generated:** February 9, 2026  
**Purpose:** Comprehensive documentation for AI agents and developers to understand the application without re-analyzing

---

## TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [API Architecture](#api-architecture)
6. [Business Logic & Features](#business-logic--features)
7. [Authentication & Authorization](#authentication--authorization)
8. [File Storage & Media](#file-storage--media)
9. [Real-time Features](#real-time-features)
10. [Email System](#email-system)
11. [Frontend Assets & Design](#frontend-assets--design)
12. [Deployment & Environment](#deployment--environment)
13. [Key Workflows](#key-workflows)
14. [Important Notes](#important-notes)

---

## EXECUTIVE SUMMARY

**Application Name:** Le Society (also referenced as "Secret Time")  
**Type:** Dating/Social Platform API  
**Primary Purpose:** Premium dating platform connecting users based on aspirations, categories, and scheduled dates

### Core Concept
- **Male Users:** Browse female profiles, express interest, purchase chat tokens to communicate
- **Female Users:** Create "date" offerings with pricing tiers, manage availability, receive payments
- **Admin Panel:** Verify users, manage content, handle moderation, view analytics

### Business Model
- Freemium with token-based chat system
- Tiered date pricing (Standard, Middle, Executive class)
- Influencer/promotion code system
- Payment processing integration

---

## TECHNOLOGY STACK

### Backend Framework
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js 4.16.4
- **Language:** JavaScript (ES6+)

### Database
- **Primary Database:** MongoDB Atlas
  - **Connection:** `mongodb+srv://ronyroyrox_db_user:Dgreatreset1!@lesociety.lalld11.mongodb.net/lesociety`
  - **ODM:** Mongoose 6.12.0
  - **Database Name:** `lesociety`

### Key Dependencies
- **Authentication:** jsonwebtoken (JWT), bcrypt (password hashing)
- **File Upload:** multer + Supabase Storage REST API
- **Email:** nodemailer with SendGrid SMTP
- **Real-time:** socket.io 4.4.1
- **Validation:** express-validator
- **Scheduling:** node-cron
- **Logging:** winston
- **Date/Time:** moment, moment-timezone
- **API Utilities:** cors, body-parser, cookie-parser

### Development Tools
- **Linter:** ESLint with Airbnb base config
- **Process Manager:** nodemon
- **View Engine:** EJS (for email templates)
- **CI/CD:** Bitbucket Pipelines

---

## PROJECT STRUCTURE

```
v2/
├── check-user.js              # Utility script to check user in database
├── restore-db.js              # Database restoration script from BSON files
├── package.json               # Root package (for DB utilities)
│
├── database/                  # MongoDB BSON backups
│   └── lesociety/
│       ├── users.bson         # User collection backup
│       ├── dates.bson         # Dates collection backup
│       ├── chats.bson         # Chat messages backup
│       ├── chatrooms.bson     # Chat rooms backup
│       ├── categories.bson    # User categories
│       ├── aspirations.bson   # User aspirations
│       ├── notifications.bson # Notifications
│       ├── countries.bson     # Country data
│       ├── influencers.bson   # Influencer codes
│       ├── promotions.bson    # Promo codes
│       ├── defaultmessages.bson # Admin message templates
│       └── *.metadata.json    # Collection metadata & indexes
│
├── assetsnew/                 # Frontend design assets & mockups
│   ├── CHATscreens/          # Chat UI mockups (10 screens)
│   ├── PAYWALLS/             # Payment screen designs (5 screens)
│   ├── POPups/               # Popup/modal designs (6 screens)
│   ├── pricing/              # Pricing screen designs (2 screens)
│   ├── sidebar/              # Sidebar navigation designs
│   ├── new-create-date/      # Date creation flow mockups (6 steps)
│   └── [various UI assets]   # Icons, buttons, badges (37 image files)
│
└── lesociety/latest/home/node/secret-time-next-api/  # Main API Application
    ├── app.js                # Express app configuration & routing setup
    ├── package.json          # API dependencies (390+ packages)
    ├── README.md             # Development notes & API workflows
    │
    ├── controllers/v1/       # Business logic controllers
    │   ├── user.js           # User management (1857 lines - largest)
    │   ├── dashboard.js      # Admin analytics & stats (47KB)
    │   ├── date.js           # Date posting & management (601 lines)
    │   ├── chat.js           # Chat & messaging (903 lines)
    │   ├── notification.js   # Notification system
    │   ├── influencer.js     # Influencer code management
    │   ├── promotion.js      # Promo code system
    │   └── [11 more controllers]
    │
    ├── models/               # Mongoose schemas (15 models)
    ├── routes/               # API route definitions (14 route files)
    ├── helpers/              # Utility functions (4 helper files)
    ├── seeder/               # Database seeding scripts (5 seeders)
    ├── views/mails/          # EJS email templates (10 templates)
    └── public/uploads/       # User uploaded files (gitignored)
```

---

## DATABASE ARCHITECTURE

### Database: `lesociety` (MongoDB Atlas)

**Connection String:**
```
mongodb+srv://ronyroyrox_db_user:Dgreatreset1!@lesociety.lalld11.mongodb.net/lesociety
```

### Collections Overview

#### 1. **users** Collection
Primary user account data for both male and female users.

**Key Fields:**
- `user_name` (String, unique, required) - Username
- `email` (String, unique, required) - Email address
- `password` (String, required) - Bcrypt hashed password
- `gender` (String) - User gender
- `age` (Number, required) - User age
- `first_name`, `middle_name`, `last_name` (String)
- `location`, `country`, `province`, `country_code` (String) - Geographic data
- `body_type`, `ethnicity`, `height`, `max_education`, `occupation` (String) - Profile details
- `is_smoker` (String)

**Image & Verification:**
- `images` (Array) - Verified profile images
- `un_verified_images` (Array) - Pending verification images
- `image_verified` (Boolean, default: true)
- `selfie`, `document` (String) - Verification documents
- `documents_verified` (Boolean, default: false)

**Profile Content:**
- `tagline` (String) - Verified tagline
- `un_verified_tagline` (String) - Pending tagline
- `description` (String) - Verified description
- `un_verified_description` (String) - Pending description
- `tag_desc_verified` (Boolean, default: true)

**Account Status:**
- `status` (Number, default: 1)
  - 1: Pending
  - 2: Verified
  - 3: Blocked/Deactivated
  - 4: Soft Deleted
- `email_verified` (Boolean, default: false)
- `verified` (Boolean, default: false)
- `role` (Number, default: 1) - 1: User, 2: Admin

**Tokens & Credits:**
- `interested_tokens` (Number, default: 0)
- `super_interested_tokens` (Number, default: 0)
- `chat_tokens` (Number, default: 0)
- `remaining_chats` (Number, default: 15)

**User Blocking:**
- `blocked_users` (Array) - All blocked users
- `blocked_users_by_self` (Array) - Users blocked by this user
- `blocked_by_others` (Array) - Other users who blocked this user

**Categorization:**
- `categatoryName` (String)
- `categatoryId` (ObjectId, ref: categories)
- `aspirationName` (String)
- `aspirationId` (ObjectId, ref: aspirations)

**Tracking:**
- `step_completed` (Number, required) - Last completed onboarding step
- `profile_completed_date` (Date)
- `is_new` (Boolean, default: true)
- `created_at` (Date, default: Toronto timezone)
- `updated_at` (Date)
- `last_logged_in`, `before_last_logged_in` (Date)
- `first30DaysDateCreateTime` (Date)

**Popups & Warnings:**
- `date_warning_popup`, `image_warning_popup` (Boolean)
- `create_date_popup_dismissed`, `date_live_popup_dismissed` (Boolean)
- `verified_screen_shown` (Boolean)
- `request_change_fired` (Boolean)
- `requested_date` (Date)

**Indexes:**
- `user_name` (unique)
- `email` (unique)

---

#### 2. **dates** Collection
Date postings created by female users.

**Key Fields:**
- `user_name` (String, required) - Creator username
- `location`, `country`, `province`, `country_code` (String)
- `standard_class_date` (String) - Standard tier experience description
- `middle_class_dates` (String) - Middle tier experience description
- `executive_class_dates` (String) - Executive tier experience description
- `date_length` (String) - Duration
- `price` (Number) - Price in currency
- `image_index` (Number, default: 0) - Selected image from user profile
- `date_details` (String) - Additional details
- `verification_docs` (String) - Verification documents

**Status Management:**
- `date_status` (Boolean, default: false) - Draft vs Live (changes on payment)
- `status` (Number, default: 1)
  - 1: Pending
  - 2: Verified
  - 3: Blocked/Deactivated
  - 4: Soft Deleted
  - 5: New (for filtering)
  - 6: Warned (for filtering)
  - 7: Re-submitted (for filtering)
- `is_new` (Boolean, default: true)
- `is_blocked_by_admin` (Number, default: 0)
- `warning_sent_date` (Date)
- `blocked_date` (Date)

**Timestamps:**
- `created_at` (Date, default: Date.now)
- `updated_at` (Date)

**Indexes:**
- `location` (descending, with collation)

---

#### 3. **chatrooms** Collection
Chat room instances between two users.

**Key Fields:**
- References to two users participating
- Room metadata and status

---

#### 4. **chats** Collection
Individual chat messages.

**Key Fields:**
- `sender_id` (ObjectId, ref: User)
- `receiver_id` (ObjectId, ref: User)
- `room_id` (ObjectId, ref: chatRoom)
- `message` (String)
- `sent_time` (Date, default: Date.now)
- `read_date_time` (Date)
- `mail_notified` (Number, default: 0)
- `deleted_date` (Date)
- `created_date` (Date)
- `update_date` (Date)

---

#### 5. **categories** Collection
User categorization (e.g., profession types, interests).

**Indexes:**
- `name` (unique)

---

#### 6. **aspirations** Collection
User aspirations/goals.

---

#### 7. **notifications** Collection
User notifications for various events.

**Purpose:**
- Profile change requests
- Admin messages
- System notifications
- Warning notifications

---

#### 8. **countries** Collection
Country reference data.

**Indexes:**
- `name` (unique)

---

#### 9. **influencers** Collection
Influencer referral codes and tracking.

**Indexes:**
- `email` (unique)
- `code` (unique)

---

#### 10. **promotions** Collection
Promotional/discount codes.

**Indexes:**
- `coupon` (unique)

---

#### 11. **defaultmessages** Collection
Admin message templates for common communications.

**Usage:**
- Tagline/description change requests
- Profile verification messages
- Rejection messages
- Approval messages

---


## API ARCHITECTURE

### Base URL Structure
```
/api/v1/
```

### API Routes Overview

#### User Routes (`/api/v1/user`)
**Authentication & Registration:**
- `POST /signup` - User registration
- `POST /login` - User login (returns JWT token)
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /verify-email/:token` - Email verification

**Profile Management:**
- `GET /` - Get all users (admin/filtered)
- `GET /user-by-name` - Get user by username
- `GET /:id` - Get user by ID
- `PUT /update` - Update user profile
- `PUT /update-status` - Update user status (admin)
- `POST /verify-taglinedescription` - Verify tagline/description changes

**Verification:**
- `POST /getverified` - Submit verification documents
- `GET /users-stats` - Get user statistics (admin)

**User Discovery:**
- Browse/filter users by various criteria
- Search by username, location, category, aspiration

---

#### Date Routes (`/api/v1/date`)
**CRUD Operations:**
- `POST /create` - Create new date posting
- `GET /` - List dates (with filters: sort, location, status, pagination)
- `GET /:id` - Get single date by ID
- `PUT /update/:id` - Update date posting
- `DELETE /:id` - Delete date (soft delete)

**Admin Operations:**
- `PUT /verify/:id` - Verify date posting
- `PUT /block/:id` - Block date posting
- `PUT /warn/:id` - Send warning for date

**Filtering Options:**
- By location
- By user_name
- By status (pending, verified, blocked)
- By date range
- Pagination support

---

#### Chat Routes (`/api/v1/chat`)
**Real-time Messaging:**
- `POST /send` - Send message
- `GET /rooms` - Get user's chat rooms
- `GET /messages/:roomId` - Get messages for a room
- `PUT /read/:messageId` - Mark message as read
- `DELETE /:messageId` - Delete message

**Chat Room Management:**
- Create chat room between users
- Check existing rooms
- Handle chat tokens/credits

**Cron Jobs:**
- Runs every minute to handle unread message notifications
- Sends email alerts for unread messages

---

#### Notification Routes (`/api/v1/notification`)
- `GET /` - List notifications (filter by user_email, status, sort)
- `POST /create` - Create notification
- `PUT /update/:id` - Update notification (mark read/unread)
- `DELETE /:id` - Delete notification (soft delete)

---

#### Files Routes (`/api/v1/files`)
- `POST /` - Upload up to 4 images to Supabase Storage

**Supported Operations:**
- Profile images
- Verification documents (selfie, ID)
- Date images

---

#### Dashboard Routes (`/api/v1/dashboard`)
**Analytics & Statistics:**
- `GET /stats` - Overall platform statistics
- `GET /user-stats` - User statistics
- `GET /date-stats` - Date posting statistics
- `GET /revenue-stats` - Revenue analytics
- `GET /geo-stats` - Geographic distribution

**Metrics Include:**
- Total users (all, pending, verified, blocked)
- Total dates (live, draft, pending)
- Active users (daily, weekly, monthly)
- New user signups
- Geographic breakdown by country/city

---

#### Promotion Routes (`/api/v1/promotion`)
- `POST /create` - Create promo code
- `GET /` - List all promo codes
- `GET /:id` - Get promo code details
- `POST /validate` - Validate promo code
- `PUT /update/:id` - Update promo code
- `DELETE /:id` - Delete promo code

**Promo Code Features:**
- Coupon code
- Discount percentage/amount
- Expiry date
- Usage limits
- Active/inactive status

---

#### Influencer Routes (`/api/v1/influencer`)
- `POST /create` - Create influencer account
- `GET /` - List influencers
- `GET /:id` - Get influencer details
- `PUT /update/:id` - Update influencer
- `DELETE /:id` - Soft delete influencer (status: 4)

**Influencer Features:**
- Unique referral code
- Tracking user signups
- Commission/analytics

---

#### Category Routes (`/api/v1/categories`)
- `GET /` - List all categories
- `POST /create` - Create category
- `PUT /update/:id` - Update category
- `DELETE /:id` - Delete category

---

#### Aspiration Routes (`/api/v1/aspirations`)
- `GET /` - List all aspirations
- `POST /create` - Create aspiration
- `PUT /update/:id` - Update aspiration
- `DELETE /:id` - Delete aspiration

---

#### Country Routes (`/api/v1/country`)
- `GET /` - List all countries
- `POST /create` - Create country entry
- `PUT /update/:id` - Update country
- `DELETE /:id` - Delete country

---

#### Default Messages Routes (`/api/v1/defaultMessage`)
- `GET /` - Get default messages (filter by messageType)
- `POST /create` - Create message template
- `POST /requestMessage` - Send message to users via email

**Message Types:**
- `taglineAndDesc` - For tagline/description change requests
- Other admin communication templates

---

#### Request Routes (`/api/v1/request`)
- Handle profile change requests
- Manage user submission workflows

---

## BUSINESS LOGIC & FEATURES

### User Lifecycle & Verification Workflow

#### 1. **User Registration Flow**
```
Step 1: Email signup → Email verification token sent
Step 2: Email verified → status remains "Pending" (status: 1)
Step 3: Complete profile → Upload images, tagline, description
Step 4: Admin review → Manually verify images/tagline/description
Step 5: Approved → status changes to "Verified" (status: 2)
```

**Key States:**
- `email_verified` = false → true (after email verification)
- `image_verified` = true by default, set to false if re-uploaded
- `tag_desc_verified` = true by default, set to false if changed
- `documents_verified` = false → true (after selfie + ID verification)
- `status` = 1 (Pending) → 2 (Verified) → 3 (Blocked) → 4 (Deleted)

#### 2. **Profile Update Workflow**
When a verified user updates profile:
1. New content goes to `un_verified_*` fields:
   - `un_verified_images`
   - `un_verified_tagline`
   - `un_verified_description`
2. `*_verified` flags set to false
3. Admin must re-verify before showing on frontend
4. `request_change_fired` flag tracks admin intervention

#### 3. **Document Verification (Batch Verification)**
- Users upload `selfie` and `document` (ID)
- `documents_verified` verified separately from profile
- Both required for full verification

---

### Date Posting System

#### Female User Date Creation Flow
```
1. Location selection (country, province, city)
2. Experience tier definitions:
   - Standard Class
   - Middle Class
   - Executive Class
3. Duration specification
4. Pricing
5. Description/details
6. Image selection (from profile images)
7. Preview
8. Payment → Status changes from draft (date_status: false) to live (date_status: true)
```

#### Date Status Management
- `status: 1` (Pending) - Awaiting admin approval
- `status: 2` (Verified) - Approved and visible
- `status: 3` (Blocked) - Admin blocked
- `status: 4` (Soft deleted)
- `status: 5` (New label for filtering)
- `status: 6` (Warned - admin sent warning)
- `status: 7` (Re-submitted after warning/changes)

#### Date Warning System
- Admin can send warnings for dates
- `warning_sent_date` tracked
- User must edit and resubmit
- Dates go to "deactive stage" during review

---

### Token & Credit System

#### Token Types
1. **Interested Tokens** (`interested_tokens`)
   - Used to show basic interest in a profile
   
2. **Super Interested Tokens** (`super_interested_tokens`)
   - Premium interest indicator

3. **Chat Tokens** (`chat_tokens`)
   - Required to initiate/continue conversations

4. **Remaining Chats** (`remaining_chats`)
   - Default: 15 free chats
   - Decrements with usage
   - Can be purchased

#### Payment Integration
- Token purchases processed
- Promo codes applicable
- Influencer codes provide discounts/bonuses

---

### Chat & Messaging System

#### Chat Room Logic
- One room per user pair
- Room created on first message
- References `sender_id` and `receiver_id`

#### Message Delivery
- Real-time via Socket.IO
- Persistent storage in `chats` collection
- Read receipts tracked (`read_date_time`)
- Email notifications for unread messages

#### Cron-based Email Notifications
```javascript
// Runs every minute
cron.schedule("* * * * *", function () {
    chatController.handleCron();
});
```
- Checks unread messages
- Sends email alerts if not notified (`mail_notified: 0`)
- Updates `mail_notified` flag after sending

---

### Notification System

#### Notification Categories
1. **Profile Change Requests**
   - Admin requests user to update profile
   - Includes pre-defined message
   - User receives email + in-app notification

2. **Verification Status Updates**
   - Approval notifications
   - Rejection notifications with reasons

3. **Date Warnings**
   - Admin warnings for date postings
   - Edit/resubmit instructions

4. **System Notifications**
   - General announcements
   - Account status changes

#### Notification Flow
```
1. Admin triggers action (e.g., request change)
2. System creates notification entry (status: 0 = unread)
3. Email sent to user
4. On user login: GET /api/v1/notification?status=0&user_email={email}
5. User views notification → status: 1 (read)
6. Red dot indicator for unread notifications
```

---

### Admin Workflow & Moderation

#### User Verification Process
```
API: POST /api/v1/user/update-status
```
Admin reviews:
- Email verification ✓
- Profile images ✓
- Tagline ✓
- Description ✓
- Documents (selfie + ID) ✓

**Status Changes:**
- 0/1: Pending
- 2: Verified
- 3: Blocked
- 4: Deleted

#### Request Change Workflow
```
1. Admin selects default message template
   GET /api/v1/defaultMessage?messageType=taglineAndDesc

2. Admin sends request to user
   POST /api/v1/defaultMessage/requestMessage
   Body: {
     user_email_list: ["user@example.com"],
     messageType: "taglineAndDesc",
     message_id: 0
   }

3. User receives email + notification

4. User updates profile → goes to un_verified_* fields

5. Admin re-verifies
   POST /api/v1/user/verify-taglinedescription
```

---


## AUTHENTICATION & AUTHORIZATION

### JWT Authentication
**Token Generation:**
- Library: `jsonwebtoken`
- Payload includes: user_id, email, role
- Expires after configurable time

**Protected Routes:**
- Authorization header: `Bearer <token>`
- Middleware validates JWT
- Role-based access control (User vs Admin)

### Password Security
- Hashing: `bcrypt` with salt rounds
- Password reset flow:
  1. User requests reset → `reset_key` generated
  2. Email sent with reset link
  3. User resets with valid token
  4. Password hashed and updated

### Email Verification
- `email_verification_token` generated on signup
- Link sent to user email
- Token validated → `email_verified` = true

---

## FILE STORAGE & MEDIA

### Supabase Storage Integration
**Configuration:**
- Upload parser: `multer` (memory storage)
- Provider: Supabase Storage via REST API
- Bucket: Configured via environment variables (`SUPABASE_STORAGE_BUCKET`)
- Access: Supabase service role key

**File Types:**
1. **Profile Images**
   - Multiple images per user
   - Stored in `images` array
   - Pending images in `un_verified_images`

2. **Verification Documents**
   - Selfie image
   - Government ID/document
   - Stored as URLs in user schema

3. **Date Images**
   - References user's profile images by index
   - `image_index` field in dates schema

**Upload Endpoints:**
- Single file: `POST /api/v1/files/upload`
- Multiple files: `POST /api/v1/files/upload-multiple`
- Delete: `DELETE /api/v1/files/delete`

---

## REAL-TIME FEATURES

### Socket.IO Implementation
**Version:** 4.4.1

**Real-time Events:**
1. **Chat Messages**
   - Instant message delivery
   - Typing indicators (if implemented)
   - Online/offline status

2. **Notifications**
   - Live notification push
   - Read receipt updates

**Connection Flow:**
```javascript
// Client connects with authentication
socket.on('connect', () => {
  socket.emit('authenticate', { token: jwt_token });
});

// Message events
socket.on('new_message', (data) => {
  // Handle incoming message
});

socket.emit('send_message', {
  room_id,
  message,
  receiver_id
});
```

---

## EMAIL SYSTEM

### SendGrid SMTP Configuration
```javascript
Host: smtp.sendgrid.net
Port: 2525
Auth: apikey / process.env.AWS_MAIL_PASS
```

### Email Templates (EJS)
Located in `views/mails/`:

1. **forgot-pwd-email.ejs**
   - Password reset link
   - Token expiration notice

2. **profile-changes.ejs** (Male users)
   - Profile update notifications
   - Change request details

3. **profile-changes-femail.ejs** (Female users)
   - Profile update notifications
   - Change request details

4. **change-request-approved.ejs**
   - Approval notification
   - Next steps

5. **change-request-rejected.ejs**
   - Rejection reasons
   - Guidance for improvement

6. **block-user-by-admin.ejs**
   - Account blocked notification
   - Reason for blocking
   - Appeal process (if applicable)

7. **access-denied.ejs**
   - Access restriction notice

8. **request-info-email.ejs**
   - Information request from admin
   - Required actions

### Email Triggers
- User registration (verification email)
- Password reset
- Profile verification status changes
- Admin communications
- Chat notifications (unread messages)
- Date posting updates
- Warning notifications

---

## FRONTEND ASSETS & DESIGN

### Design System (Figma)
**Base Design:**
```
https://www.figma.com/design/wCwJ7S5BvOnrpEMFCLIJcc/Le-Society_Assets-and-Designs-1.2
```

### Asset Categories

#### 1. **Chat Screens** (`assetsnew/CHATscreens/`)
- 10+ screen mockups
- Chat interface designs
- Empty state: `nochat.png`
- Message bubbles
- Chat room UI

#### 2. **Paywalls** (`assetsnew/PAYWALLS/`)
- Male paywall designs
- Female paywall designs (ladies)
- Token purchase screens
- Subscription tiers

#### 3. **Popups** (`assetsnew/POPups/`)
- Warning popups
- Confirmation modals
- Success/error states
- Date creation warnings
- Image verification popups

#### 4. **Pricing Screens** (`assetsnew/pricing/`)
- Token packages
- Pricing tiers
- Payment options

#### 5. **Sidebar Navigation** (`assetsnew/sidebar/`)
- Female menu design
- Male menu design
- Navigation structure

#### 6. **Date Creation Flow** (`assetsnew/new-create-date/`)
**6-Step Process:**
1. `location-page1.jpg` - Location selection
2. `experiance-page2.jpg` - Experience definition
3. `Earning-page3.jpg` - Pricing setup
4. `Duration-page4.jpg` - Duration selection
5. `description-page5.jpg` - Details & description
6. `preview-page6.jpg` - Preview & submit

#### 7. **UI Components**
- `interested` - Interest button states
- `interested-locked` - Locked state
- `interested-unlocked-png.png` - Unlocked state
- `superinterested` - Super interest button
- `superinterestedtext` - Text variations
- `interestedtext` - Interest text
- `lockedtext` - Locked state text
- `bestring.png` - Badge/ribbon
- `viewprofile` - Profile view button
- `managebutton` - Management actions
- `notification` - Notification icon
- `primarycta`, `primarycta2` - Call-to-action buttons
- `arrow1`, `arrow2`, `arrow3` - Navigation arrows
- `ellipse2`, `ellipse3`, `ellips4` - Decorative elements
- `line2`, `line3` - Dividers
- `star1` - Rating/favorite icons
- Various ring/badge elements

### Post-Payment Design
`post-payment-design.png` - Success screen after payment

---

## DEPLOYMENT & ENVIRONMENT

### Environment Variables (`.env`)
**Required Variables:**
```bash
# Database
MONGO_URI=mongodb+srv://...
# OR
MONGO_USER=ronyroyrox_db_user
MONGO_PASS=Dgreatreset1!
MONGO_HOST=lesociety.lalld11.mongodb.net
DB_NAME=lesociety

# Application
APP_URL=<frontend_url>
NODE_ENV=production/development

# Supabase Storage
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_STORAGE_BUCKET=secret-time-uploads

# Email (SendGrid)
AWS_MAIL_PASS=<sendgrid_api_key>

# JWT
JWT_SECRET=<secret_key>
JWT_EXPIRES_IN=7d

# Optional
CLOUD_CONVERT_KEY=<if_used>
```

### CI/CD Pipeline
**Platform:** Bitbucket Pipelines
**Configuration:** `bitbucket-pipelines.yml`

### Application Startup
```bash
# Development
npm install
nodemon bin/www

# Production
npm install --production
node bin/www
```

### Logging
**Winston Configuration:**
- File logging for production
- Console logging for development
- Log levels: error, warn, info, debug
- Structured JSON logs
- Log rotation (configured)

### Process Management
- Development: `nodemon` (auto-restart on changes)
- Production: PM2 or similar process manager recommended

---

## KEY WORKFLOWS

### 1. New User Registration (Female)
```
1. POST /api/v1/user/signup
   - email, password, username, gender: female
   
2. Email verification sent
   - User clicks link: GET /api/v1/user/verify-email/:token
   
3. Complete profile
   - PUT /api/v1/user/update
   - Upload images: POST /api/v1/files/upload-multiple
   - Add tagline, description, details
   
4. Upload verification docs
   - POST /api/v1/user/getverified
   - Selfie + ID document
   
5. Admin reviews (Dashboard)
   - Verify images, tagline, description
   - Verify documents
   - POST /api/v1/user/update-status { status: 2 }
   
6. User verified → Can create dates
```

### 2. New User Registration (Male)
```
1-4. Same as female registration

5. Admin reviews
   - Verify profile content
   - POST /api/v1/user/update-status { status: 2 }
   
6. User verified → Can browse dates, send interests, chat
```

### 3. Creating a Date (Female User)
```
1. POST /api/v1/date/create
   - Draft created (date_status: false, status: 1)
   
2. Define all tiers:
   - standard_class_date
   - middle_class_dates
   - executive_class_dates
   - date_length, price, location, details
   
3. Payment processing
   - date_status → true (Live)
   
4. Admin review
   - Verify date content
   - PUT /api/v1/date/verify/:id
   - status → 2 (Verified and visible)
```

### 4. Male User Browsing & Chatting
```
1. Browse dates
   - GET /api/v1/date?location=toronto&sort=date
   
2. View female profile
   - GET /api/v1/user/:id
   
3. Express interest
   - Deduct interested_token or super_interested_token
   
4. Initiate chat (if tokens available)
   - Check/create chat room
   - POST /api/v1/chat/send
   - Deduct chat_token or remaining_chats
   
5. Real-time messaging via Socket.IO
   - Messages persist in database
   - Email notifications for unread (cron job)
```

### 5. Admin Dashboard Workflow
```
1. Login with admin role
   - POST /api/v1/user/login (role: 2)
   
2. View pending users
   - GET /api/v1/user?status=1
   
3. Review user profile
   - GET /api/v1/user/:id
   - Check images, tagline, description, documents
   
4. Decision:
   
   A. Approve:
      POST /api/v1/user/update-status
      { status: 2 }
   
   B. Request Changes:
      - Select template: GET /api/v1/defaultMessage?messageType=taglineAndDesc
      - Send request: POST /api/v1/defaultMessage/requestMessage
      - Creates notification + sends email
   
   C. Block:
      POST /api/v1/user/update-status
      { status: 3 }
      - Triggers block-user-by-admin.ejs email
   
5. Monitor analytics
   - GET /api/v1/dashboard/stats
   - GET /api/v1/dashboard/user-stats
   - GET /api/v1/dashboard/geo-stats
```

### 6. Profile Update by Verified User
```
1. User modifies profile
   - PUT /api/v1/user/update
   - New images → un_verified_images
   - New tagline → un_verified_tagline
   - New description → un_verified_description
   
2. Verification flags reset
   - image_verified → false
   - tag_desc_verified → false
   
3. Admin notified/reviews
   
4. Admin approves
   - POST /api/v1/user/verify-taglinedescription
   - Moves un_verified_* → verified fields
   - Sets flags to true
```

### 7. Date Warning & Resubmission
```
1. Admin warns date
   - PUT /api/v1/date/warn/:id
   - status → 6 (warned)
   - warning_sent_date set
   - Email notification sent
   
2. User edits date
   - PUT /api/v1/date/update/:id
   - status → 7 (re-submitted)
   
3. Admin re-reviews
   - PUT /api/v1/date/verify/:id
   - status → 2 (verified)
```

---

## IMPORTANT NOTES

### Critical Business Rules

1. **Verification Sequence**
   - Email must be verified before profile completion
   - Profile (images/tagline/description) verified together
   - Documents verified separately
   - All must be verified for status: 2

2. **Status Transition Rules**
   - Status changes from 0→1 (avoid falsy value issues)
   - Once status: 2, any profile update requires re-verification
   - Status: 3 (blocked) requires admin action to unblock
   - Status: 4 (deleted) is soft delete - data retained

3. **Token Economy**
   - `remaining_chats`: 15 free chats initially
   - Additional chats require `chat_tokens`
   - Interest expressions require `interested_tokens` or `super_interested_tokens`
   - Token purchase through payment integration

4. **Date Visibility**
   - Only dates with date_status: true AND status: 2 are visible
   - Draft dates (date_status: false) not shown
   - Blocked dates (status: 3) hidden
   - Warned dates (status: 6) hidden until re-submitted

5. **Geographic Data Consistency**
   - Users and dates have: location, country, province, country_code
   - Dashboard shows geographic distribution
   - Filtering by location case-insensitive (collation)

6. **Blocking System**
   - Three blocking arrays per user:
     - `blocked_users`: Complete list
     - `blocked_users_by_self`: Users this user blocked
     - `blocked_by_others`: Users who blocked this user
   - Blocked users cannot see each other's profiles or chat

7. **First 30 Days Tracking**
   - `first30DaysDateCreateTime` tracks date creation for new users
   - Special handling/benefits for new users in first month

8. **Popup Management**
   - Various popups tracked to prevent re-showing:
     - `date_warning_popup`
     - `image_warning_popup`
     - `create_date_popup_dismissed`
     - `date_live_popup_dismissed`
     - `verified_screen_shown`

### Common Gotchas

1. **Timezone Handling**
   - User creation uses Toronto timezone: `moment().tz("America/Toronto")`
   - Dates use UTC: `Date.now`
   - Be consistent when filtering/comparing dates

2. **Array Uniqueness**
   - User schema declares arrays as `unique: true` but MongoDB doesn't enforce this on arrays
   - Handle uniqueness in application logic

3. **Password Encoding**
   - MongoDB URI password must be URL-encoded: `encodeURIComponent(password)`
   - Special characters in password can break connection

4. **Mongoose Debug Mode**
   - `mongoose.set('debug', true)` is enabled
   - All queries logged to console (disable in production for performance)

5. **CORS Configuration**
   - Wide-open CORS: `Access-Control-Allow-Origin: *`
   - Consider restricting in production

6. **File Upload Paths**
   - `public/uploads/` is gitignored
   - Ensure directory exists or handle creation
   - S3 is primary storage, local may be fallback

### Performance Considerations

1. **Database Indexes**
   - Critical indexes on: user_name, email (users)
   - Location index with collation (dates)
   - Add indexes for frequently queried fields

2. **Pagination**
   - Implement pagination on all list endpoints
   - Default page size: typically 10-50 items
   - Use `skip()` and `limit()` carefully for large datasets

3. **Cron Job Frequency**
   - Email notification cron runs EVERY MINUTE
   - Can be resource-intensive with many users
   - Consider throttling or batching

4. **Socket.IO Scaling**
   - Single server setup currently
   - For scaling: use Redis adapter for multiple instances

5. **Image Optimization**
   - No image compression mentioned in code
   - Consider adding image optimization before S3 upload
   - Use thumbnails for list views

### Security Considerations

1. **Credentials in Code**
   - Database credentials currently in `app.js` and scripts
   - Move all to `.env` file
   - Never commit `.env` to repository

2. **JWT Secret**
   - Must be strong, random, environment-specific
   - Rotate periodically in production

3. **Input Validation**
   - express-validator used
   - Ensure all user inputs validated
   - Sanitize before database operations

4. **File Upload Security**
   - Validate file types
   - Check file sizes
   - Scan for malware if handling user uploads

5. **Rate Limiting**
   - No rate limiting observed in code
   - Add for production (express-rate-limit)
   - Especially for: login, signup, password reset

### Testing & Quality Assurance

**Current State:**
- No test files observed
- `npm test` returns error message

**Recommendations:**
- Unit tests for helpers, utilities
- Integration tests for API endpoints
- Test user workflows end-to-end
- Load testing for cron jobs and Socket.IO

---

## DEVELOPMENT SCRIPTS

### Database Utilities

**Restore Database:**
```bash
# Located at root: v2/restore-db.js
node restore-db.js
```
- Reads BSON files from `database/lesociety/`
- Drops existing collections
- Inserts data from backups
- Verifies specific user after restore

**Check User:**
```bash
# Located at root: v2/check-user.js
node check-user.js
```
- Lists all users in database
- Searches for specific user (manman@yopmail.com)
- Useful for debugging user issues

### Seeder Scripts
Located in `lesociety/latest/home/node/secret-time-next-api/seeder/`:

```bash
# Run seeders (adjust path as needed)
node seeder/user.js
node seeder/dates.js
node seeder/aspiration.js
node seeder/category.js
node seeder/default-message.js
```

---

## QUICK REFERENCE

### User Status Codes
- `0` or `1`: Pending (awaiting verification)
- `2`: Verified (active account)
- `3`: Blocked/Deactivated (by admin)
- `4`: Soft Deleted (data retained)

### Date Status Codes
- `1`: Pending (awaiting verification)
- `2`: Verified (visible to users)
- `3`: Blocked (hidden by admin)
- `4`: Soft Deleted
- `5`: New (filtering label)
- `6`: Warned (admin warning sent)
- `7`: Re-submitted (after warning/edit)

### User Roles
- `1`: Regular User
- `2`: Admin

### Boolean Flags Quick Reference
- `email_verified`: Email confirmation status
- `image_verified`: Profile images approval
- `tag_desc_verified`: Tagline & description approval
- `documents_verified`: ID verification status
- `verified`: Overall account verification
- `date_status`: Draft (false) vs Live (true) for dates
- `is_new`: New user/date indicator
- `request_change_fired`: Admin requested changes
- `mail_notified`: Email notification sent flag

### Common API Patterns

**Get with Filters:**
```
GET /api/v1/user?status=2&country=Canada&sort=-created_at&page=1&limit=20
GET /api/v1/date?location=Toronto&status=2&user_name=jane@example.com
```

**Authentication Header:**
```
Authorization: Bearer <jwt_token>
```

**Update Status:**
```
PUT /api/v1/user/update-status
Body: { user_id: "...", status: 2 }
```

---

## CONCLUSION

This application is a **complex dating platform** with:
- Multi-tier user verification system
- Token-based economy
- Real-time chat functionality
- Admin moderation workflow
- Payment integration
- Email notification system
- Geographic filtering
- Comprehensive user/date management

**Primary Tech Stack:**
- Node.js + Express + MongoDB (Mongoose)
- Socket.IO for real-time features
- Supabase Storage for file storage
- SendGrid for email
- JWT for authentication

**Key Differentiators:**
- Date marketplace model (female-created offerings)
- Tiered pricing (Standard/Middle/Executive)
- Comprehensive verification workflow
- Admin-moderated content approval
- Token economy for premium features

---

**Document Version:** 1.0  
**Last Updated:** February 9, 2026  
**Maintained By:** AI Development Team  

---

## NEXT STEPS FOR NEW DEVELOPERS

1. **Setup Local Environment:**
   - Clone repository
   - Copy `.env.example` to `.env` (if exists) or create `.env`
   - Install dependencies: `npm install`
   - Ensure MongoDB connection
   - Start: `npm run dev` or `nodemon`

2. **Understand Data Model:**
   - Review all schemas in `models/`
   - Run database seeders for test data
   - Explore collections in MongoDB Compass/Atlas

3. **Test API Endpoints:**
   - Use Postman/Insomnia
   - Start with authentication endpoints
   - Create test users and dates
   - Test admin workflows

4. **Review Business Logic:**
   - Read through controller files
   - Understand verification workflows
   - Study token economy implementation
   - Review chat system architecture

5. **Check Frontend Integration:**
   - Review design assets in `assetsnew/`
   - Understand UI flows
   - Match API responses to frontend needs

**For Updates/Changes:**
- Always update this document when making architectural changes
- Keep it synchronized with codebase
- Document any new workflows or features
- Update environment variable requirements

---


---

## 🚨 HOW TO START THE APP WITHOUT GETTING INTO TROUBLE

### CRITICAL STARTUP CHECKLIST

⚠️ **FOLLOW THESE STEPS IN ORDER TO AVOID ISSUES**

---

### 1. **Environment Setup (MUST DO FIRST)**

Create `.env` file in `lesociety/latest/home/node/secret-time-next-api/`:

```bash
# OPTION 1: Use full connection string
MONGO_URI=mongodb+srv://ronyroyrox_db_user:Dgreatreset1!@lesociety.lalld11.mongodb.net/lesociety?retryWrites=true&w=majority

# OPTION 2: Use separate credentials (password will be URL-encoded automatically)
MONGO_USER=ronyroyrox_db_user
MONGO_PASS=Dgreatreset1!
MONGO_HOST=lesociety.lalld11.mongodb.net
DB_NAME=lesociety

# Application
NODE_ENV=development
PORT=3001

# Supabase Storage (REQUIRED for file uploads)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_STORAGE_BUCKET=secret-time-uploads

# Email (REQUIRED for notifications)
AWS_MAIL_PASS=your_sendgrid_api_key_here

# JWT (REQUIRED for authentication)
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# App URL (for email links)
APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT:**
- If using `MONGO_PASS` with special characters (like `!`), the app will auto-encode it
- DO NOT manually URL-encode the password in `.env`
- The app handles encoding in `app.js` line 65: `encodeURIComponent(process.env.MONGO_PASS)`

---

### 2. **Install Dependencies**

```bash
cd v2/lesociety/latest/home/node/secret-time-next-api
npm install
```

**Expected:** ~390 packages installed (may take 2-3 minutes)

---

### 3. **Database Connection Test**

**Before starting the app**, verify MongoDB connection:

```bash
# Quick test using the utility script
cd v2/
node check-user.js
```

**Expected output:**
- Should connect successfully
- Lists users in database
- If fails: Check your MONGO_URI or credentials

---

### 4. **Create Required Directories**

```bash
cd lesociety/latest/home/node/secret-time-next-api
mkdir -p public/uploads
```

**Why:** The app expects `public/uploads/` for local file handling (even if using S3)

---

### 5. **Start the Application**

**Development Mode (with auto-reload):**
```bash
npm run dev
# OR
npx nodemon bin/www
```

**Production Mode:**
```bash
npm start
# OR
node bin/www
```

**Expected Console Output:**
```
Server listening on port: 3001
connection successful
Connected to Mongo DB
running a task every minute  <-- Cron job for chat notifications
```

---

### 6. **Verify Startup Success**

Test the API is running:

```bash
curl http://localhost:3001/api/v1/
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "API is running"
}
```

---

## ⚠️ COMMON STARTUP ERRORS & SOLUTIONS

### Error 1: MongoDB Connection Failed
```
MongoServerError: bad auth : Authentication failed
```

**Solutions:**
- ✅ Check password is correct
- ✅ Ensure special characters NOT manually URL-encoded in `.env`
- ✅ Verify MongoDB Atlas IP whitelist (add your IP or use `0.0.0.0/0` for testing)
- ✅ Check MongoDB Atlas user has correct permissions

---

### Error 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**
```bash
# Find process using port 3001
lsof -i :3001
# OR
netstat -ano | findstr :3001

# Kill the process
kill -9 <PID>
```

**Or use different port:**
```bash
PORT=3002 npm start
```

---

### Error 3: Supabase Storage Credentials Missing
```
Error: Missing credentials in config
```

**Solution:**
- Must provide Supabase credentials in backend `.env`
- Use dummy values for local testing:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=secret-time-uploads
```
- File uploads will fail, but app will start

---

### Error 4: JWT Secret Missing
```
Error: secretOrPrivateKey must have a value
```

**Solution:**
```bash
# Add to .env
JWT_SECRET=your_random_secret_key_at_least_32_chars_long
```

---

### Error 5: Cron Job Errors Every Minute
```
running a task every minute
Error: Cannot read property 'find' of undefined
```

**Cause:** Database connection not ready when cron starts

**Solution:**
- This is usually transient and resolves after DB connection establishes
- If persists, comment out cron in `app.js` lines 108-111:
```javascript
// cron.schedule("* * * * *", function () {
//     console.log("running a task every minute");
//     chatController.handleCron();
// });
```

---

### Error 6: Module Not Found
```
Error: Cannot find module 'xyz'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🔧 DEVELOPMENT MODE BEST PRACTICES

### 1. **Use Nodemon for Auto-Reload**
```bash
npm install -g nodemon
nodemon bin/www
```

### 2. **Disable Mongoose Debug in Production**
In `app.js` line 75, comment out:
```javascript
// mongoose.set("debug", true);  // Comment this in production
```

**Why:** Logs every DB query to console - performance impact

### 3. **Environment-Specific Configs**
```bash
# Development
NODE_ENV=development npm start

# Production
NODE_ENV=production npm start
```

### 4. **Monitor Logs**
Winston logs to console in development. Watch for:
- Database connection errors
- Authentication failures
- API validation errors

---

## 🧪 TESTING THE APPLICATION

### Step 1: Create Test User
```bash
POST http://localhost:3001/api/v1/user/signup
Content-Type: application/json

{
  "user_name": "testuser@example.com",
  "email": "testuser@example.com",
  "password": "Test123!",
  "gender": "male",
  "age": 25,
  "first_name": "Test",
  "last_name": "User"
}
```

### Step 2: Login
```bash
POST http://localhost:3001/api/v1/user/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "Test123!"
}
```

**Save the JWT token from response for authenticated requests**

### Step 3: Get User Profile
```bash
GET http://localhost:3001/api/v1/user/user-by-name?user_name=testuser@example.com
Authorization: Bearer <your_jwt_token>
```

---

## 📊 SEEDING TEST DATA

If you need sample data:

### Option 1: Restore from Backup
```bash
cd v2/
node restore-db.js
```
**⚠️ WARNING:** This DROPS all existing collections and restores from BSON files

### Option 2: Run Seeders
```bash
cd lesociety/latest/home/node/secret-time-next-api/

# Seed users
node seeder/user.js

# Seed dates
node seeder/dates.js

# Seed categories
node seeder/category.js

# Seed aspirations
node seeder/aspiration.js

# Seed default messages
node seeder/default-message.js
```

---

## 🎯 QUICK API REFERENCE FOR TESTING

### User Management
```bash
# Get all users (admin)
GET http://localhost:3001/api/v1/user

# Get pending users
GET http://localhost:3001/api/v1/user?status=1

# Get verified users
GET http://localhost:3001/api/v1/user?status=2

# Update user status (admin)
PUT http://localhost:3001/api/v1/user/update-status
Body: { "user_id": "...", "status": 2 }
```

### Date Management
```bash
# Get all dates
GET http://localhost:3001/api/v1/date

# Filter by location
GET http://localhost:3001/api/v1/date?location=Toronto

# Filter by status
GET http://localhost:3001/api/v1/date?status=2

# Sort by date
GET http://localhost:3001/api/v1/date?sort=date
```

### Admin Dashboard
```bash
# Get statistics
GET http://localhost:3001/api/v1/dashboard/stats

# Get user stats
GET http://localhost:3001/api/v1/user/users-stats
```

### Notifications
```bash
# Get unread notifications for user
GET http://localhost:3001/api/v1/notification?status=0&user_email=user@example.com&sort=sent_time
```

### Default Messages (Admin)
```bash
# Get tagline/description templates
GET http://localhost:3001/api/v1/defaultMessage?messageType=taglineAndDesc

# Send request to users
POST http://localhost:3001/api/v1/defaultMessage/requestMessage
Body: {
  "user_email_list": ["user1@example.com", "user2@example.com"],
  "messageType": "taglineAndDesc",
  "message_id": 0
}
```

---

## 🚀 PRODUCTION DEPLOYMENT NOTES

### 1. **Security Hardening**
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Restrict CORS to specific frontend domain
- [ ] Enable rate limiting (express-rate-limit)
- [ ] Disable mongoose debug mode
- [ ] Use environment variables for ALL secrets

### 2. **Performance Optimization**
- [ ] Use PM2 for process management
- [ ] Enable gzip compression
- [ ] Add Redis for Socket.IO scaling (if multiple instances)
- [ ] Configure MongoDB connection pooling
- [ ] Add CDN for static assets

### 3. **Monitoring**
- [ ] Set up Winston file logging (already configured)
- [ ] Add error tracking (Sentry, LogRocket)
- [ ] Monitor MongoDB performance (Atlas monitoring)
- [ ] Track API response times
- [ ] Monitor cron job execution

### 4. **Backup Strategy**
- [ ] Automated MongoDB backups (Atlas handles this)
- [ ] Supabase storage backup policy defined
- [ ] Regular BSON exports using `mongodump`

---

## 📝 TROUBLESHOOTING CHECKLIST

When things go wrong, check in this order:

1. ✅ **Database Connection**
   - Can you connect to MongoDB Atlas?
   - Is your IP whitelisted?
   - Are credentials correct?

2. ✅ **Environment Variables**
   - Is `.env` file in correct directory?
   - Are all required variables set?
   - No syntax errors in `.env`?

3. ✅ **Port Availability**
   - Is port 3001 free?
   - Any firewall blocking?

4. ✅ **Dependencies**
   - Run `npm install` fresh
   - Check Node.js version (v14+ recommended)

5. ✅ **File Permissions**
   - Can app create files in `public/uploads/`?
   - Read access to all source files?

6. ✅ **Logs**
   - Check console output for errors
   - Review Winston logs
   - Check MongoDB Atlas logs

---

## 🆘 GETTING HELP

**Debug Mode:**
```bash
# Enable verbose logging
DEBUG=* npm start
```

**Check Database:**
```bash
cd v2/
node check-user.js  # Lists all users
```

**Validate Environment:**
```javascript
// Add to app.js temporarily to debug
console.log('Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
```

---

**✅ If you followed all steps above, the app should start successfully!**

**Default URL:** `http://localhost:3001/api/v1/`

**Key Endpoints to Test:**
- Health: `GET /api/v1/`
- Signup: `POST /api/v1/user/signup`
- Login: `POST /api/v1/user/login`
- Users: `GET /api/v1/user` (requires auth)

---


---
---

## 🚨 CRITICAL STARTUP ISSUE & FIX - READ THIS FIRST! 🚨

### ⚠️ PROBLEM: "Something went wrong" on Login / JWT Error

**Symptom:**
- Frontend shows "Something went wrong" when trying to login
- API logs show: `uncaughtException: secretOrPrivateKey must have a value`
- Login API returns 500 error or no response

**Root Cause:**
The API code uses `process.env.JWT_SECRET_TOKEN` but the default .env file only has `JWT_SECRET`.

**This is THE #1 issue that breaks the app on first startup!**

---

### ✅ THE FIX (MUST DO THIS!)

**Location:** `v2/lesociety/latest/home/node/secret-time-next-api/.env`

**Add this line:**
```bash
JWT_SECRET_TOKEN=your-secret-key-change-this-in-production
```

**Complete JWT section should look like:**
```bash
# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_SECRET_TOKEN=your-secret-key-change-this-in-production  # ← THIS LINE IS REQUIRED!
JWT_EXPIRES_IN=7d
```

**After adding, RESTART the API:**
```bash
# Kill the API process
pkill -f "node bin/www"

# Start it again
cd v2/lesociety/latest/home/node/secret-time-next-api
node bin/www &
```

---

### 🔍 WHY THIS HAPPENS

**Code Location:** `controllers/v1/user.js` (lines 752, 1093)

The controller uses:
```javascript
const token = jwt.sign(payload, process.env.JWT_SECRET_TOKEN, { expiresIn: "24h" });
```

But default .env only has `JWT_SECRET` (without `_TOKEN`).

**This mismatch causes:**
1. ✅ User authentication succeeds (password verified)
2. ❌ JWT token generation fails (no secret key)
3. ❌ API crashes with uncaught exception
4. ❌ Frontend receives error response

---

### 📋 VERIFICATION STEPS

**1. Test API directly:**
```bash
curl -X POST http://localhost:3001/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "afro@yopmail.com", "password": "123456"}'
```

**Expected Success Response:**
```json
{
  "data": {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "email": "afro@yopmail.com",
      "user_name": "afro.8",
      ...
    }
  },
  "status": 200,
  "error": false,
  "message": "Logged in successfully!"
}
```

**2. Check API logs:**
```bash
# Should see successful login
POST /api/v1/user/login 200 686.375 ms - 4896

# Should NOT see this error
uncaughtException: secretOrPrivateKey must have a value
```

**3. Test from Frontend:**
- Open http://localhost:3000
- Login with: afro@yopmail.com / 123456
- Should redirect to dashboard (not "Something went wrong")

---

### 🛠️ ALTERNATIVE FIXES

If you don't want to modify .env, you can modify the code instead:

**Option 1: Update all controller files** (NOT RECOMMENDED - changes codebase)
```javascript
// Change this:
const token = jwt.sign(payload, process.env.JWT_SECRET_TOKEN, { expiresIn: "24h" });

// To this:
const token = jwt.sign(payload, process.env.JWT_SECRET || process.env.JWT_SECRET_TOKEN, { expiresIn: "24h" });
```

**Option 2: Use environment variable** (Quick test)
```bash
export JWT_SECRET_TOKEN=your-secret-key-change-this-in-production
node bin/www
```

**RECOMMENDED:** Just add `JWT_SECRET_TOKEN` to .env file (cleanest solution).

---

### 📝 AFFECTED FILES

**Backend:**
- `controllers/v1/user.js` - Login function (line 752)
- `controllers/v1/user.js` - Social login (line 1093)
- `.env` - Environment configuration

**Frontend:**
- No frontend changes needed
- Frontend just receives proper JWT token after fix

---

### 🎯 CHECKLIST FOR FUTURE SETUPS

When setting up this app on a new machine/server:

```
□ Clone repository
□ Install backend dependencies (npm install)
□ Create .env file in API directory
□ Add database credentials (MONGO_USER, MONGO_PASS, etc.)
□ Add JWT_SECRET
□ ✅ ADD JWT_SECRET_TOKEN ← DON'T FORGET THIS!
□ Add AWS credentials (if using S3)
□ Add email credentials (if using notifications)
□ Start API (node bin/www)
□ Test login endpoint before starting frontend
□ Install frontend dependencies
□ Start frontend (npm run dev)
□ Test login from UI
```

---

### 🔧 PRODUCTION NOTES

**Security:**
- Use different JWT secrets for dev/staging/production
- Use strong random strings (32+ characters)
- Never commit real secrets to git
- Rotate secrets periodically

**Example secure secret generation:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use output in .env
JWT_SECRET_TOKEN=a7f3d8e2b4c9f1a6e8d3b7c2f9a4e6d8b3c7f2a9e5d1b8c4f7a3e9d6b2c8f5a1
```

---

## 🎉 SUMMARY

**Before Fix:**
- ❌ Login fails with "Something went wrong"
- ❌ API crashes on JWT generation
- ❌ Frontend can't authenticate users

**After Fix:**
- ✅ Login works perfectly
- ✅ JWT tokens generated correctly
- ✅ Users can authenticate and access app
- ✅ Full stack application functional

**THE GOLDEN RULE:**
> Always add BOTH `JWT_SECRET` AND `JWT_SECRET_TOKEN` to .env!

---
