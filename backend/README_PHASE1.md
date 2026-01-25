# Splitwith Backend - Phase 1 Complete

## 📁 Project Structure

```
backend/
├── src/main/java/com/splittrip/backend/
│   ├── config/
│   │   ├── MongoConfig.java           # MongoDB Atlas configuration
│   │   └── SecurityConfig.java        # Security (temporarily open for dev)
│   ├── controller/
│   │   ├── UserController.java        # POST /users, GET /users/{id}
│   │   ├── TripController.java        # Trip & balance endpoints
│   │   └── ExpenseController.java     # POST /expenses
│   ├── dto/
│   │   ├── ApiResponse.java           # Standard response wrapper
│   │   ├── CreateUserRequest.java     # User creation DTO
│   │   ├── CreateTripRequest.java     # Trip creation DTO
│   │   ├── CreateExpenseRequest.java  # Expense creation DTO
│   │   └── UserBalance.java           # Balance calculation DTO
│   ├── exception/
│   │   └── GlobalExceptionHandler.java # JSON error responses
│   ├── model/
│   │   ├── User.java                  # User entity (unique email)
│   │   ├── Trip.java                  # Trip entity
│   │   └── Expense.java               # Expense entity
│   ├── repository/
│   │   ├── UserRepository.java        # User data access
│   │   ├── TripRepository.java        # Trip data access
│   │   └── ExpenseRepository.java     # Expense data access
│   └── service/
│       ├── UserService.java           # User business logic
│       ├── TripService.java           # Trip business logic
│       ├── ExpenseService.java        # Expense business logic
│       └── BalanceService.java        # Balance calculation logic
├── PHASE1_VERIFICATION.md             # Complete verification guide
└── Splitwith_Phase1.postman_collection.json # Postman tests
```

---

## 🚀 Quick Start

### 1. Run the Application
```powershell
cd C:\projects\splitwith\backend
.\mvnw.cmd spring-boot:run
```

### 2. Verify Startup
Check logs for:
- ✅ MongoDB Atlas connection
- ✅ Tomcat on port 9090
- ✅ No errors

### 3. Import Postman Collection
- Import `Splitwith_Phase1.postman_collection.json`
- Create environment variables: `aliceId`, `bobId`, `tripId`
- Run requests in order

---

## 📊 Phase 1 Features

### ✅ User Module
- **POST /users** - Create user with email uniqueness
- **GET /users/{id}** - Retrieve user by ID
- Validation: Required fields, valid email format
- Error: Duplicate email rejection

### ✅ Trip Module
- **POST /trips** - Create trip (creator auto-added as member)
- **GET /trips/user/{userId}** - List user's trips
- **POST /trips/{tripId}/join** - Add member to trip
- Validation: No duplicate members

### ✅ Expense Module
- **POST /expenses** - Add expense with equal split
- Validation:
  - Amount > 0
  - splitBetween not empty
  - All users are trip members

### ✅ Balance Calculation
- **GET /trips/{tripId}/balances** - Calculate balances
- Logic:
  - Payer gets credited full amount
  - Each person in split gets debited equal share
  - Balance sum always = 0
  - Positive = receives money
  - Negative = owes money

---

## 🧪 Balance Calculation Example

**Scenario:**
- Alice pays 200 for hotel (split between Alice & Bob)
- Bob pays 80 for dinner (split between Alice & Bob)

**Calculation:**
```
Alice:
  Paid 200, owes 100 (hotel split) = +100
  Paid 0, owes 40 (dinner split) = -40
  Total: +60 (should receive 60)

Bob:
  Paid 0, owes 100 (hotel split) = -100
  Paid 80, owes 40 (dinner split) = +40
  Total: -60 (owes 60)

Balance check: 60 + (-60) = 0 ✅
```

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* entity data */ },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": "Error message here"
}
```

---

## ✅ Verification Checklist

Follow `PHASE1_VERIFICATION.md` for complete step-by-step verification.

**Critical Checks:**
- [ ] Users saved in MongoDB `splitwith.users`
- [ ] Trips saved in MongoDB `splitwith.trips`
- [ ] Expenses saved in MongoDB `splitwith.expenses`
- [ ] Duplicate email rejected
- [ ] Duplicate trip member rejected
- [ ] Balance sum = 0
- [ ] No HTTP 500 errors
- [ ] All responses are JSON

---

## 🔧 Tech Stack

- **Spring Boot 4.0.2**
- **Java 25**
- **Spring Data MongoDB**
- **MongoDB Atlas** (cloud database)
- **Lombok** (boilerplate reduction)
- **Jakarta Validation** (input validation)
- **Maven** (build tool)

---

## 📌 Next Steps (Phase 2)

Once Phase 1 is verified complete:
1. Add JWT authentication
2. Add user authorization (trip access control)
3. Add settlement suggestions (minimize transactions)
4. Add unequal split options

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```properties
# Check application.properties has correct URI
spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/splitwith
```

### Port Already in Use
```powershell
# Kill process on port 9090
Get-NetTCPConnection -LocalPort 9090 | Select-Object -ExpandProperty OwningProcess
Stop-Process -Id <PID> -Force
```

### Validation Errors Not Showing
Ensure `@Valid` annotation is on controller method parameters.

---

## 📞 Phase 1 Support

If verification fails:
1. Check MongoDB Atlas connection logs
2. Verify all collections exist
3. Test each endpoint individually in Postman
4. Check application logs for stack traces
5. Ensure `application.properties` has detailed error config

**Phase 1 is production-ready when all verification tests pass!**
