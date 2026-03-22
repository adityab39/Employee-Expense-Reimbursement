import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const categories = [
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals" },
  { value: "office", label: "Office Supplies" },
  { value: "software", label: "Software" },
  { value: "other", label: "Other" },
];

export default function SubmitExpensePage() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(expenseId);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    category: "travel",
    receipt: null,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState("");

  useEffect(() => {
    async function loadExpense() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/expenses/${expenseId}/`);

        if (data.employee.id !== user?.id || data.status !== "pending") {
          navigate(`/expenses/${expenseId}`, { replace: true });
          return;
        }

        setForm({
          title: data.title,
          description: data.description,
          amount: data.amount,
          category: data.category,
          receipt: null,
        });
        setExistingReceiptUrl(data.receipt_url || "");
      } catch {
        navigate("/expenses", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadExpense();
  }, [expenseId, isEditMode, navigate, user?.id]);

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

    if (form.receipt) {
      payload.append("receipt", form.receipt);
    }

    try {
      const request = isEditMode
        ? api.patch(`/expenses/${expenseId}/`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : api.post("/expenses/", payload, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      const { data } = await request;
      navigate(`/expenses/${isEditMode ? expenseId : data.id}`);
    } catch (requestError) {
      const payloadError = requestError.response?.data;
      setError(
        typeof payloadError === "object" ? JSON.stringify(payloadError) : "Unable to save expense."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="screen-message">Loading expense editor...</div>;
  }

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow={isEditMode ? "Edit Submission" : "Attach the receipt and send it forward"}
        title={isEditMode ? "Update your pending expense" : undefined}
        description={
          isEditMode
            ? "You can adjust the details of a pending expense before it reaches final review."
            : "Receipts are required so every submission has the supporting documentation needed for review."
        }
      />

      <form className="editor-card form-grid expense-form" onSubmit={handleSubmit}>
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
          <input
            name="receipt"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            required={!isEditMode}
          />
          {isEditMode && existingReceiptUrl ? (
            <span className="field-help">
              Leave this empty to keep the current receipt, or upload a new file to replace it.
            </span>
          ) : null}
        </label>

        {error ? <div className="form-error full-width">{error}</div> : null}

        <div className="full-width button-row">
          <button type="button" className="ghost-button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? (isEditMode ? "Saving..." : "Submitting...") : isEditMode ? "Save Changes" : "Submit Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
