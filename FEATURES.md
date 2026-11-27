# Feature Guide — Foodie Corner Online Food Ordering System

## 1. Overview

Foodie Corner is a multi-role food ordering platform consisting of three major user types:

- Customers
- Restaurant Owners
- Administrators

Each role has separate responsibilities and workflows.

---

# Customer Features

## Registration and Authentication
Customers can:
- Create an account
- Login/logout
- Maintain authenticated sessions using JWT

## Restaurant and Menu Browsing
Customers can:
- View available restaurants
- Browse food categories
- Search food items
- Filter menu items

## Cart Management
Customers can:
- Add food items
- Increase/decrease quantity
- Remove items
- Review order summary before checkout

## Ordering System
Customers can:
- Enter delivery information
- Select payment method preference
- Place orders
- View previous orders

The system supports multiple restaurant orders by separating items according to restaurant.

## Order Tracking
Customers can monitor order progress through statuses:

Pending → Confirmed → Preparing → Ready for Pickup → Out for Delivery → Delivered

## Reviews and Support
Customers can:
- Review delivered orders
- Submit complaints/support requests

---

# Restaurant Features

Restaurant owners can:

- Access restaurant dashboard
- Manage restaurant profile
- Add and manage food items
- Upload food images
- Change food availability
- View customer orders
- Update order processing status
- View earnings summary

---

# Admin Features

Administrators can:

- Monitor system activity
- Manage users
- Manage restaurants
- Approve/reject restaurant registrations
- Manage food information
- Monitor orders
- Resolve customer complaints

---

# Additional Information

## Payment System

The project includes payment method selection UI.

Supported selections:
- Cash on Delivery
- eSewa
- Khalti
- ConnectIPS

However, external payment gateway verification is not implemented.

## Delivery Tracking

The current system provides order-status tracking. Real-time GPS rider tracking is not implemented.

