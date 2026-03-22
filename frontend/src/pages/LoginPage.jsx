import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await login(form);
      const destination =
        location.state?.from?.pathname ||
        (data.user.role === "manager" || data.user.role === "admin"
          ? "/manager/dashboard"
          : "/dashboard");
      navigate(destination, { replace: true });
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setError(
        detail === "No active account found with the given credentials"
          ? "Invalid credentials"
          : detail || "Invalid credentials"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel feature-panel">
        <span className="eyebrow">Employee Expense Reimbursement</span>
        <div className="hero-visual" aria-hidden="true">
          <div className="floating-receipt receipt-one">
            <span />
            <span />
            <span />
          </div>
          <div className="floating-receipt receipt-two">
            <span />
            <span />
            <span />
          </div>
          <div className="approval-chip">Approved faster</div>
        </div>
        <h1>Submit. Review. Reimburse.</h1>
        <p>A clean workflow for employee expenses, receipts, and approvals.</p>
      </div>

      <div className="auth-panel form-panel">
        <h2>Welcome back</h2>
        <p>Sign in to manage submissions and approvals.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="helper-copy">
          New here? <Link to="/register">Create an employee account</Link>
        </p>
      </div>
    </div>
  );
}
