# PHASE 1 VERIFICATION GUIDE - Splitwith Backend

## Pre-Verification Setup

1. **Start the application:**
   ```powershell
   cd C:\projects\splitwith\backend
   .\mvnw.cmd clean spring-boot:run
   ```

2. **Verify MongoDB Atlas connection in logs:**
   ```
   ✅ hosts=[splittrip-cluster.if1r1wh.mongodb.net:27017]
   ✅ credential=MongoCredential{userName='splitwith_db_user'...}
   ✅ Monitor thread successfully connected to server
   ✅ Tomcat started on port 9090
   ```

---

## 1. USER MODULE VERIFICATION

### Step 1.1: Create User (Success Case)
**Request:**
```http
POST http://localhost:9090/users
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "createdAt": "2026-01-25T18:00:00"
  },
  "error": null
}
```

**✅ Verify in MongoDB Atlas:**
- Database: `splitwith`
- Collection: `users`
- Document should have: `_id`, `name`, `email`, `createdAt`

---

### Step 1.2: Create Another User (Bob)
```http
POST http://localhost:9090/users

{
  "name": "Bob Smith",
  "email": "bob@example.com"
}
```

**✅ Verify:** Another document in `users` collection

---

### Step 1.3: Test Duplicate Email (Failure Case)
```http
POST http://localhost:9090/users

{
  "name": "Alice Duplicate",
  "email": "alice@example.com"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "data": null,
  "error": "Email already exists"
}
```

---

### Step 1.4: Get User by ID
```http
GET http://localhost:9090/users/{userId}
```
Replace `{userId}` with the actual ID from Step 1.1

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "createdAt": "..."
  },
  "error": null
}
```

---

### Step 1.5: Test Invalid User ID
```http
GET http://localhost:9090/users/invalid-id-12345
```

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": "User not found with id: invalid-id-12345"
}
```

---

## 2. TRIP MODULE VERIFICATION

### Step 2.1: Create Trip
**Request:**
```http
POST http://localhost:9090/trips

{
  "name": "Europe Vacation 2026",
  "createdBy": "{aliceId}"
}
```
Replace `{aliceId}` with Alice's actual ID

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid-here",
    "name": "Europe Vacation 2026",
    "createdBy": "{aliceId}",
    "members": ["{aliceId}"],
    "createdAt": "2026-01-25T18:05:00"
  },
  "error": null
}
```

**✅ Verify in MongoDB Atlas:**
- Collection: `trips`
- Document has: creator auto-added to `members` array

---

### Step 2.2: Add Bob to Trip
```http
POST http://localhost:9090/trips/{tripId}/join

{
  "userId": "{bobId}"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "{tripId}",
    "name": "Europe Vacation 2026",
    "createdBy": "{aliceId}",
    "members": ["{aliceId}", "{bobId}"],
    "createdAt": "..."
  },
  "error": null
}
```

**✅ Verify:** `members` array now has 2 users

---

### Step 2.3: Test Duplicate Member
```http
POST http://localhost:9090/trips/{tripId}/join

{
  "userId": "{bobId}"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "User is already a member of this trip"
}
```

---

### Step 2.4: Get User's Trips
```http
GET http://localhost:9090/trips/user/{aliceId}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "{tripId}",
      "name": "Europe Vacation 2026",
      "createdBy": "{aliceId}",
      "members": ["{aliceId}", "{bobId}"],
      "createdAt": "..."
    }
  ],
  "error": null
}
```

---

## 3. EXPENSE MODULE VERIFICATION

### Step 3.1: Create Expense (Alice pays for hotel)
```http
POST http://localhost:9090/expenses

{
  "tripId": "{tripId}",
  "paidBy": "{aliceId}",
  "amount": 200.00,
  "description": "Hotel booking",
  "splitBetween": ["{aliceId}", "{bobId}"]
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "expense-uuid",
    "tripId": "{tripId}",
    "paidBy": "{aliceId}",
    "amount": 200.0,
    "description": "Hotel booking",
    "splitBetween": ["{aliceId}", "{bobId}"],
    "createdAt": "..."
  },
  "error": null
}
```

**✅ Verify in MongoDB Atlas:**
- Collection: `expenses`
- Document saved with all fields

**Balance Logic:**
- Alice paid 200
- Split between Alice & Bob (2 people)
- Each owes 100
- Alice balance: +200 -100 = +100 (should receive)
- Bob balance: 0 -100 = -100 (owes)

---

### Step 3.2: Create Another Expense (Bob pays for dinner)
```http
POST http://localhost:9090/expenses

{
  "tripId": "{tripId}",
  "paidBy": "{bobId}",
  "amount": 80.00,
  "description": "Dinner",
  "splitBetween": ["{aliceId}", "{bobId}"]
}
```

**Expected Response (201 Created)**

**New Balance Logic:**
- Alice: +100 -40 = +60 (should receive 60)
- Bob: -100 +80 -40 = -60 (owes 60)

---

### Step 3.3: Test Invalid Amount
```http
POST http://localhost:9090/expenses

{
  "tripId": "{tripId}",
  "paidBy": "{aliceId}",
  "amount": -50,
  "description": "Test",
  "splitBetween": ["{aliceId}"]
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Amount must be greater than 0"
}
```

---

### Step 3.4: Test Empty splitBetween
```http
POST http://localhost:9090/expenses

{
  "tripId": "{tripId}",
  "paidBy": "{aliceId}",
  "amount": 100,
  "description": "Test",
  "splitBetween": []
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "SplitBetween cannot be empty"
}
```

---

## 4. BALANCE CALCULATION VERIFICATION

### Step 4.1: Get Trip Balances
```http
GET http://localhost:9090/trips/{tripId}/balances
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "{aliceId}",
      "userName": "Alice Johnson",
      "balance": 60.0
    },
    {
      "userId": "{bobId}",
      "userName": "Bob Smith",
      "balance": -60.0
    }
  ],
  "error": null
}
```

**✅ Critical Verification:**
- Sum of all balances MUST = 0
- Positive balance = user receives money
- Negative balance = user owes money

**Manual Calculation:**
```
Alice:
  - Paid 200 for hotel (split 2 ways): +200 -100 = +100
  - Paid 0 for dinner (split 2 ways): 0 -40 = -40
  - Total: +100 -40 = +60 ✅

Bob:
  - Paid 0 for hotel (split 2 ways): 0 -100 = -100
  - Paid 80 for dinner (split 2 ways): +80 -40 = +40
  - Total: -100 +40 = -60 ✅

Balance Check: +60 + (-60) = 0 ✅
```

---

## 5. ERROR HANDLING VERIFICATION

### Test 5.1: Missing Required Field
```http
POST http://localhost:9090/users

{
  "name": "Test User"
}
```

**Expected:** Validation error about missing email

---

### Test 5.2: Invalid Email Format
```http
POST http://localhost:9090/users

{
  "name": "Test",
  "email": "invalid-email"
}
```

**Expected:** "Email must be valid"

---

### Test 5.3: Non-existent Trip ID
```http
GET http://localhost:9090/trips/fake-trip-id/balances
```

**Expected:** "Trip not found"

---

## PHASE 1 COMPLETION CHECKLIST

### ✅ MongoDB Collections Verified
- [ ] `users` collection has Alice & Bob with correct fields
- [ ] `trips` collection has trip with members array
- [ ] `expenses` collection has 2 expenses

### ✅ API Functionality
- [ ] POST /users creates user successfully
- [ ] Duplicate email is rejected
- [ ] GET /users/{id} retrieves user
- [ ] POST /trips creates trip (creator auto-added)
- [ ] POST /trips/{id}/join adds member
- [ ] Duplicate member rejected
- [ ] GET /trips/user/{id} lists user's trips
- [ ] POST /expenses creates expense with validation
- [ ] GET /trips/{id}/balances calculates correctly

### ✅ Data Integrity
- [ ] Balance sum = 0
- [ ] No HTTP 500 errors
- [ ] All errors return JSON (no Whitelabel pages)
- [ ] createdAt timestamps exist on all entities

### ✅ Logs Clean
- [ ] No MongoDB connection errors
- [ ] No Spring Security auth errors
- [ ] Application starts cleanly

---

## Next Steps After Phase 1 ✅

Once ALL checklist items pass:
- **Phase 2:** Add JWT authentication & authorization
- **Phase 3:** Add settlement suggestions (minimize transactions)
- **Phase 4:** Add unequal split logic (percentage/custom amounts)

---

**Phase 1 is PRODUCTION-CLEAN when:**
1. All 4 modules work end-to-end
2. Balance calculation is mathematically correct
3. MongoDB Atlas shows all data
4. Zero errors in Postman tests
5. Clean logs with no exceptions
