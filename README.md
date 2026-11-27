# Foodie Corner — Online Food Ordering System

Foodie Corner is a full-stack online food ordering platform developed as a 4th semester Web Technology project. The system allows customers to explore restaurants, browse food items, manage carts, place orders, track order status, provide reviews, and communicate complaints. Restaurant owners can manage their menus and process customer orders, while administrators manage the overall platform.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | CSS |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Authentication | JWT + bcryptjs |
| API Communication | Axios |
| File Upload | Multer |
| Security | Helmet, CORS, Rate Limiting |

## Main Features

### Customer Module
- User registration and login
- Browse restaurants and food menus
- Search and filter food items
- Add food items to cart
- Update cart quantity and remove items
- Place orders
- View order history
- Track order status
- Submit reviews for delivered orders
- Submit support complaints

### Restaurant Module
- Restaurant account management
- Restaurant dashboard
- Manage food items
- Add, update, delete food items
- Upload food images
- Manage food availability
- View incoming orders
- Update order processing status
- View sales/earnings summary

### Admin Module
- Admin dashboard
- Manage users
- Manage restaurants
- Approve or reject restaurant applications
- Manage food items
- Monitor orders
- Handle customer complaints
- Manage platform activities

## Project Setup

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create the MySQL database using the provided SQL files and configure environment variables before running.

## Important Notes

- Online payment options shown in the interface are payment method selections for demonstration. Actual payment gateway integration is not included.
- Order tracking represents order-status tracking, not GPS-based rider tracking.
- The project is designed for academic demonstration and can be extended with real payment gateways, delivery rider management, and advanced analytics.

