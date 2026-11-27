import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Customer pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import ReviewPage from "./pages/ReviewPage";
import SupportPage from "./pages/SupportPage";

// Restaurant Panel pages
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantMenu from "./pages/restaurant/RestaurantMenu";
import RestaurantCategories from "./pages/restaurant/RestaurantCategories";
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";
import RestaurantEarnings from "./pages/restaurant/RestaurantEarnings";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminFoods from "./pages/AdminFoods";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminRestaurants from "./pages/AdminRestaurants";
import AdminComplaints from "./pages/AdminComplaints";

function App() {
  return (
    <div>
      <Navbar />

      <div className="container">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer (login required) */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/orders/:id/track" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/orders/:id/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

          {/* Restaurant Panel */}
          <Route path="/restaurant" element={<ProtectedRoute><RestaurantDashboard /></ProtectedRoute>} />
          <Route path="/restaurant/orders" element={<ProtectedRoute><RestaurantOrders /></ProtectedRoute>} />
          <Route path="/restaurant/menu" element={<ProtectedRoute><RestaurantMenu /></ProtectedRoute>} />
          <Route path="/restaurant/categories" element={<ProtectedRoute><RestaurantCategories /></ProtectedRoute>} />
          <Route path="/restaurant/profile" element={<ProtectedRoute><RestaurantProfile /></ProtectedRoute>} />
          <Route path="/restaurant/earnings" element={<ProtectedRoute><RestaurantEarnings /></ProtectedRoute>} />

          {/* Admin (admin role required) */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/foods" element={<ProtectedRoute adminOnly={true}><AdminFoods /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/restaurants" element={<ProtectedRoute adminOnly={true}><AdminRestaurants /></ProtectedRoute>} />
          <Route path="/admin/complaints" element={<ProtectedRoute adminOnly={true}><AdminComplaints /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "60px" }}>404 – Page Not Found</h2>} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
