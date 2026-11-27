import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoggingIn(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const user = res.data.user;

      login(res.data.token, user);

      // Route based on user role
      if (user.role === "admin" || user.role === "superadmin") {
        navigate("/admin");
      } else if (user.role === "restaurant") {
        navigate("/restaurant");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoggingIn(false);
    }
  }

  // Quick fill helper for testing demo roles
  function quickFill(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <span className="auth-icon">🔑</span>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-sub">Sign in to your account to continue</p>
        </div>

        {error && <div className="auth-error-banner">⚠️ {error}</div>}

        {/* Demo Account Chips */}
        <div className="demo-accounts-box">
          <span className="demo-title">Quick Demo Sign In:</span>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip superadmin"
              onClick={() => quickFill("admin@food.com", "password")}
              title="Main Admin"
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="demo-chip hotel"
              onClick={() => quickFill("restaurant@food.com", "password")}
              title="Restaurant Owner - MoMo Hub"
            >
              🍳 Restaurant 1
            </button>
            <button
              type="button"
              className="demo-chip hotel"
              onClick={() => quickFill("spice@food.com", "password")}
              title="Restaurant Owner - Spice Garden"
            >
              🍳 Restaurant 2
            </button>
            <button
              type="button"
              className="demo-chip hotel"
              onClick={() => quickFill("himalayan@food.com", "password")}
              title="Restaurant Owner - Himalayan Bites"
            >
              🍳 Restaurant 3
            </button>
            <button
              type="button"
              className="demo-chip customer"
              onClick={() => quickFill("rahul@gmail.com", "password")}
              title="Customer - Rahul"
            >
              🛒 Customer 1
            </button>
            <button
              type="button"
              className="demo-chip customer"
              onClick={() => quickFill("priya@gmail.com", "password")}
              title="Customer - Priya"
            >
              🛒 Customer 2
            </button>
          </div>
          <p style={{fontSize:'11px',color:'#9ca3af',marginTop:'6px'}}>💡 Tip: Open multiple browser tabs and log into different accounts at the same time!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="auth-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loggingIn}>
            {loggingIn ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/register">Register Here →</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
