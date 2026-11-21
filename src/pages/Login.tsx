import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const success = login(email, password);

    if (success) {
      navigate("/profile");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          SHOP<span>ORA.</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-tag">WELCOME BACK</span>
          <h1>
            Sign in to your <span>account.</span>
          </h1>
          <p>Enter your details to continue shopping with SHOPORA.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <div className="auth-input">
            <Mail size={19} />
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-label-row">
            <label htmlFor="login-password">Password</label>
            <button
              type="button"
              className="auth-text-button"
              onClick={() => setError("Password reset is not implemented yet.")}
            >
              Forgot password?
            </button>
          </div>

          <div className="auth-input">
            <LockKeyhole size={19} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <label className="auth-checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

          <button type="submit" className="auth-submit">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-divider">
          <span>NEW TO SHOPORA?</span>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create account</Link>
        </p>

        <Link to="/" className="auth-back">
          Back to shopping
        </Link>
      </div>
    </main>
  );
}

export default Login;
