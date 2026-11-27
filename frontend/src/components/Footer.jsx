import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="footer-container">
        
        {/* Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <span className="footer-logo-icon">🍽️</span>
            <span className="footer-logo-text">Foodie Corner</span>
            <span className="footer-country-tag">🇳🇵 Nepal</span>
          </div>
          <p className="footer-desc">
            Authentic, fresh, and delicious food delivered hot to your doorstep across Kathmandu valley.
          </p>
          <div className="footer-payments">
            <span className="pay-tag">💵 COD</span>
            <span className="pay-tag esewa">🟩 eSewa</span>
            <span className="pay-tag khalti">🟣 Khalti</span>
            <span className="pay-tag ips">🏦 ConnectIPS</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Our Menu</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/orders">Order Tracking</Link></li>
          </ul>
        </div>

        {/* Operating Hours */}
        <div className="footer-col">
          <h4 className="footer-heading">Opening Hours</h4>
          <p className="footer-info-text">
            <strong>Monday – Sunday:</strong><br />
            09:00 AM – 10:00 PM
          </p>
          <span className="footer-status-pill">● Open Now for Delivery</span>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4 className="footer-heading">Kathmandu Hub</h4>
          <p className="footer-info-text">
            📍 Durbar Marg, Kathmandu 44600<br />
            📞 +977 9841234567 / 01-4234567<br />
            ✉️ info@foodiecorner.com.np
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <span>© {new Date().getFullYear()} Foodie Corner Kathmandu. All rights reserved.</span>
          <span>Crafted with ❤️ in Kathmandu, Nepal 🇳🇵</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
