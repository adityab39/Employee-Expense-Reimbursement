import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await register(form);
      setSuccess("Account created successfully. You can log in now.");
      setTimeout(() => navigate("/login"), 800);
    } catch (requestError) {
      const payload = requestError.response?.data;
      setError(typeof payload === "object" ? JSON.stringify(payload) : "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel feature-panel">
        <span className="eyebrow">Start Submitting</span>
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
          <div className="approval-chip">Receipts ready</div>
        </div>
        <h1>Start submitting in minutes.</h1>
        <p>Employee accounts begin here. Manager and admin accounts are added separately.</p>
      </div>

      <div className="auth-panel form-panel">
        <h2>Create account</h2>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            First name
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Last name
            <input name="last_name" value={form.last_name} onChange={handleChange} required />
          </label>

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
          {success ? <div className="form-success">{success}</div> : null}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="helper-copy">
          Already registered? <Link to="/login">Go to login</Link>
        </p>
      </div>
    </div>
  );
}
