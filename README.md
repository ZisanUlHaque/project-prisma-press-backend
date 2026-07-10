# 📝 Prisma Press Backend

> **A Modular Blog Backend with Premium Content & Stripe Payments**

A robust backend API for a modern blogging platform built with **Express**, **TypeScript**, **Prisma**, and **PostgreSQL**. Users can create posts, engage through comments, subscribe for **premium content access via Stripe**, and admins can moderate content with powerful reporting tools.

---

## ✨ Features

### 🔐 Authentication
- User registration with automatic profile creation
- Secure login with JWT (access + refresh tokens)
- Token refresh mechanism
- HTTP-only cookie storage

### 👤 User Management
- Profile retrieval and updates
- Password hashing with bcrypt
- Role-based access (USER / ADMIN)

### 📝 Posts
- Create, read, update, and delete posts
- **Premium posts** — restricted to paid subscribers only
- Search posts by title, tags, author, status
- Filter by featured, premium, status, and more
- Paginated listings with sorting
- View count tracking
- Featured posts (Admin only)

### 💬 Comments
- Public comment reading
- Authenticated users can post comments
- Owner-only edit and delete
- Admin moderation (Approve / Reject)

### 💎 Premium Content
- Dedicated premium posts module
- Access restricted based on active subscription
- Preview mode for non-subscribers

### 💳 Stripe Subscription
- Subscribe to premium plan via **Stripe Checkout**
- Access premium content while subscription is active
- Automatic subscription status sync via webhooks
- Cancellation and expiration handling
- View subscription status anytime

### 📊 Admin Dashboard
- Aggregate statistics on posts, users, comments, and subscriptions
- Full content moderation
- User role management

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| **Runtime** | Node.js |
| **Language** | TypeScript (Strict mode) |
| **Framework** | Express 5 |
| **ORM** | Prisma 7.x |
| **Database** | PostgreSQL |
| **Adapter** | @prisma/adapter-pg |
| **Authentication** | JWT + bcrypt |
| **Payment** | Stripe Subscriptions |
| **Middleware** | cors, cookie-parser, body-parser |
| **Deployment** | Vercel / Render |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Stripe Account](https://stripe.com/) (for premium subscriptions)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for webhook testing)
- **pnpm** or **npm** (both supported)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/prisma-press-backend.git
cd prisma-press-backend

# 2. Install dependencies
pnpm install
# or
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your values

# 4. Run database migrations
pnpm db:migrate

# 5. Generate Prisma client
pnpm db:generate

# 6. Start development server
pnpm dev
# or
npm run dev

```
### 🔐 Environment Variables
```bash
PORT=5000
APP_URL=http://localhost:5173
DATABASE_URL=postgresql://user:pass@localhost:5432/prisma_press

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_PRICE_ID=price_...

```


### 📡 API Endpoints
```bash
Base URL: http://localhost:5000
## Auth
Method	Endpoint	Access
POST	/api/auth/login	Public
POST	/api/auth/refresh-token	Public
## Users
Method	Endpoint	Access
POST	/api/users/register	Public
GET	/api/users/me	USER / ADMIN
PUT	/api/users/my-profile	USER / ADMIN
## Posts
Method	Endpoint	Access
GET	/api/posts	Public
GET	/api/posts/stats	ADMIN
GET	/api/posts/my-posts	USER / ADMIN
GET	/api/posts/:postId	Public
POST	/api/posts	USER / ADMIN
PATCH	/api/posts/:postId	USER / ADMIN
DELETE	/api/posts/:postId	USER / ADMIN
## Premium
Method	Endpoint	Access
GET	/api/premium	Subscribed / ADMIN
GET	/api/premium/:postId	Subscribed / ADMIN
## Comments
Method	Endpoint	Access
GET	/api/comments/author/:authorId	Public
GET	/api/comments/:commentId	Public
POST	/api/comments	USER / ADMIN
PATCH	/api/comments/:commentId	USER / ADMIN
DELETE	/api/comments/:commentId	USER / ADMIN
PATCH	/api/comments/:commentId/moderate	ADMIN
##Subscription
Method	Endpoint	Access
POST	/api/subscription/checkout	USER / ADMIN
POST	/api/subscription/webhook	Stripe
GET	/api/subscription/status	USER / ADMIN
Total: 20 endpoints

```
### 📖 Response Format
```bash
JSON

{
  "success": true,
  "statusCode": 200,
  "message": "Request completed successfully",
  "meta": { "page": 1, "limit": 10, "total": 42 },
  "data": {}
}
```
## 👥 Roles & Permissions
```bash
Action	USER	Subscribed	ADMIN
View Public Posts	✅	✅	✅
View Premium Posts	❌	✅	✅
Create / Edit Own Post	✅	✅	✅
Edit / Delete Any Post	❌	❌	✅
Set Featured	❌	❌	✅
Moderate Comments	❌	❌	✅
View Stats	❌	❌	✅
🗄️ Data Models
User → id, name, email, password, role, activeStatus + Profile
Profile → userId (unique), profilePhoto, bio
Post → title, content, thumbnail, isFeatured, isPremium, status, tags, views, authorId
Comment → content, authorId, postId, status
Subscription → userId, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd

Enums
text

Role                → USER | ADMIN | AUTHOR
PostStatus          → PUBLISHED | DRAFT | ARCHIVED
CommentStatus       → APPROVED | REJECT
SubscriptionStatus  → ACTIVE | CANCELED | EXPIRED

```
### 📁 Project Structure
```bash

prisma-press-backend/
├── generated/                 # Prisma client
├── prisma/
│   ├── migrations/
│   └── schema/
├── src/
│   ├── config/                # Env config
│   ├── lib/                   # Prisma & Stripe clients
│   ├── middlewares/           # Auth, error handlers
│   ├── module/
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── posts/
│   │   ├── premium/
│   │   ├── user/
│   │   └── subscription/
│   ├── utils/                 # Helpers
│   ├── app.ts
│   └── server.ts
├── .env.example
└── package.json
```
### 🔒 Security
```bash
Passwords hashed with bcrypt
HTTP-only JWT cookies
Role-based route protection
Stripe webhook signature verification
Premium access checked against active subscription
```
### 📝 License
MIT © Zisan Ul Haque