import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ExpenseDetailPage() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expense, setExpense] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadExpense() {
      try {
        const { data } = await api.get(`/expenses/${expenseId}/`);
        setExpense(data);
      } finally {
        setLoading(false);
      }
    }

    loadExpense();
  }, [expenseId]);

  async function handleReview(action) {
    setSubmitting(true);
    try {
      const endpoint = action === "comment" ? "comment" : action;
      const { data } = await api.post(`/expenses/${expenseId}/${endpoint}/`, { comment });
      setExpense((current) => (action === "comment" ? { ...current, comments: [...current.comments, data] } : data));
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this pending expense?");
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/expenses/${expenseId}/`);
      navigate("/expenses");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="screen-message">Loading expense details...</div>;
  }

  if (!expense) {
    return <div className="screen-message">Expense not found.</div>;
  }

  const canReview = user?.role === "manager" || user?.role === "admin";
  const canManageExpense =
    user?.role === "employee" && expense.employee.id === user?.id && expense.status === "pending";

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow={`Expense #${expense.id}`}
        title={expense.title}
        description={expense.description}
        actions={
          <div className="button-row">
            <StatusBadge status={expense.status} />
            {canManageExpense ? (
              <>
                <Link className="ghost-button" to={`/expenses/${expense.id}/edit`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        }
      />

      <section className="detail-grid">
        <article className="editor-card">
          <h3>Submission details</h3>
          <dl className="detail-list">
            <div>
              <dt>Employee</dt>
              <dd>{expense.employee.email}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>${expense.amount}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{expense.category}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{new Date(expense.submitted_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Receipt</dt>
              <dd>
                <a className="text-link" href={expense.receipt_url} target="_blank" rel="noreferrer">
                  Open uploaded receipt
                </a>
              </dd>
            </div>
          </dl>
        </article>

        <article className="editor-card">
          <h3>Review history</h3>
          {expense.comments.length ? (
            <div className="comment-stack">
              {expense.comments.map((item) => (
                <div key={item.id} className="comment-card">
                  <div className="comment-meta">
                    <strong>{item.reviewer.email}</strong>
                    <span>{item.action}</span>
                  </div>
                  <p>{item.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No comments yet.</p>
          )}
        </article>
      </section>

      {canReview ? (
        <section className="editor-card">
          <h3>Manager review</h3>
          <label>
            Comment
            <textarea rows="4" value={comment} onChange={(event) => setComment(event.target.value)} />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="ghost-button"
              onClick={() => handleReview("comment")}
              disabled={submitting || !comment}
            >
              Add Comment
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleReview("reject")}
              disabled={submitting || !comment}
            >
              Reject
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => handleReview("approve")}
              disabled={submitting || !comment}
            >
              Approve
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
