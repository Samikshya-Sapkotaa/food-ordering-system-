# Testing Guide — Foodie Corner

## Running the Project

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Ensure MySQL is running and database configuration is completed.

---

# Test Accounts

Use the accounts created in the database seed file or create new accounts through registration.

Example quick demonstration:

Customer:
- Email: rahul@gmail.com
- Password: password

Admin:
- Email: admin@food.com
- Password: password

Restaurant:
- Use a registered restaurant account

---

# Functional Test Cases

| ID | Module | Test | Expected Result |
|---|---|---|---|
| TC-01 | Registration | Register new customer | Account created successfully |
| TC-02 | Login | Enter valid credentials | User redirected to dashboard/home |
| TC-03 | Menu | Browse food items | Available food displayed |
| TC-04 | Cart | Add/remove/update quantity | Cart updates correctly |
| TC-05 | Checkout | Place order | Order stored in database |
| TC-06 | Orders | View order history | Previous orders displayed |
| TC-07 | Tracking | Check order status | Current order status displayed |
| TC-08 | Review | Review delivered order | Review saved successfully |
| TC-09 | Restaurant | Add food item | Food item added |
| TC-10 | Restaurant | Update order status | Customer sees updated status |
| TC-11 | Admin | Approve restaurant | Restaurant status updated |
| TC-12 | Admin | Manage users/orders | Changes reflected in system |

---

# Notes

- Payment options are demonstration selections only.
- Order tracking is status-based.
- Proper database configuration is required before testing.
