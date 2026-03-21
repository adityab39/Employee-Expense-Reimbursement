import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import api from "../services/api";

const categories = [
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals" },
  { value: "office", label: "Office Supplies" },
  { value: "software", label: "Software" },
  { value: "other", label: "Other" },
];

export default function SubmitExpensePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    category: "travel",
    receipt: null,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("amount", form.amount);
    payload.append("category", form.category);
    payload.append("receipt", form.receipt);

    try {
      const { data } = await api.post("/expenses/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/expenses/${data.id}`);
    } catch (requestError) {
      const payloadError = requestError.response?.data;
      setError(typeof payloadError === "object" ? JSON.stringify(payloadError) : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow="New Submission"
        title="Attach the receipt and send it forward"
        description="Receipts are required so every submission has the supporting documentation needed for review."
      />

      <form className="editor-card form-grid" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Amount
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </label>

        <label className="full-width">
          Description
          <textarea
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Receipt
          <input name="receipt" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} required />
        </label>

        {error ? <div className="form-error full-width">{error}</div> : null}

        <div className="full-width">
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
