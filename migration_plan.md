# Database Migration Plan: MySQL to Neon PostgreSQL (ABC Books)

This document outlines the steps taken and remaining to migrate the ABC Books backend from a local MySQL database to Neon PostgreSQL.

## Status Summary

The backend code has been completely refactored to use the Neon PostgreSQL driver and PostgreSQL-compatible SQL syntax. All core routes, including books, authentication, orders, cart, and users, are now ready for Neon.

---

## 📋 Migration Checklist

### Phase 1: Preparation (COMPLETED)
- [x] Install `@neondatabase/serverless` package: `npm install @neondatabase/serverless`
- [x] Create a Neon PostgreSQL project and database.
- [x] Obtain the connection string (DATABASE_URL).

### Phase 2: Backend Refactoring (COMPLETED)
- [x] **Core Server:** Modified `backend/server.js` to use `neon` instead of `mysql2`.
- [x] **Books Route:** Modified `backend/routes/books.js` (PostgreSQL syntax, parameter markers).
- [x] **Auth Route:** Modified `backend/routes/auth.js` (PostgreSQL syntax, RETURNING).
- [x] **Orders Route:** Modified `backend/routes/orders.js` (Complex joins, inserts).
- [x] **Categories Route:** Modified `backend/routes/categories.js`.
- [x] **Cart Route:** Modified `backend/routes/cart.js`.
- [x] **Users Route:** Modified `backend/routes/users.js`.
- [x] **Wishlist Route:** Modified `backend/routes/wishlist.js`.
- [x] **Database Setup Script:** Modified `backend/setup-database.js` for PostgreSQL schema.

### Phase 3: Data Migration (PENDING - Requires Neon Connection)
- [ ] Update `backend/.env` with your Neon `DATABASE_URL`.
- [ ] Run the database setup: `node backend/setup-database.js`
- [ ] Run the book import: `node backend/import-demo-books.js`

### Phase 4: Production Deployment (PENDING)
- [ ] Add `DATABASE_URL` to Vercel Environment Variables.
- [ ] Deploy the updated code to Vercel.

---

## 🛠️ How to Complete the Migration

### 1. Set Up Environment Variables
Ensure your `backend/.env` file contains your Neon connection string:
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2. Initialize the Database
Run the schema setup script to create all necessary tables in Neon:
```bash
node backend/setup-database.js
```

### 3. Seed Demo Data
Populate the database with the initial set of books:
```bash
node backend/import-demo-books.js
```

### 4. Verify Local Connection
Start the server and check the health endpoint:
```bash
cd backend
node server.js
```
Visit `http://localhost:5000/api/health` to confirm "Neon PostgreSQL" is connected.

---

## 💡 Key Changes Made
- **Driver:** Switched from `mysql2` to `@neondatabase/serverless`.
- **Syntax:** 
  - Changed `?` to `$1, $2, ...` for query parameters.
  - Used `RETURNING *` for INSERT and UPDATE statements.
  - Replaced `GROUP_CONCAT` with `STRING_AGG` (in books.js).
  - Updated result handling from `[rows]` to `rows`.
  - Replaced `affectedRows` with `result.length` (using RETURNING).
- **Schema:** 
  - Changed `SERIAL` for auto-incrementing IDs.
  - Changed `TIMESTAMPTZ` for time zones.
  - Modified foreign key constraints to be compatible with PostgreSQL.

---

## 🚀 Live Site Status
Once the code is pushed and the Vercel environment variables are updated, the errors on [abcbooks.store](https://abcbooks.store) should be resolved, and the books should start appearing.
