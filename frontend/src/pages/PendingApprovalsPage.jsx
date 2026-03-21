import { useEffect, useState } from "react";

import ExpenseTable from "../components/ExpenseTable";
import PageHeader from "../components/PageHeader";
import api from "../services/api";

export default function PendingApprovalsPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPending() {
      try {
        const { data } = await api.get("/expenses/pending/");
        setExpenses(data.results || []);
      } finally {
        setLoading(false);
      }
    }

    loadPending();
  }, []);

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow="Pending Queue"
        title="Requests waiting on manager action"
        description="Use this queue to review supporting details and move submissions forward."
      />

      {loading ? (
        <div className="screen-message">Loading pending approvals...</div>
      ) : (
        <ExpenseTable expenses={expenses} showEmployee />
      )}
    </div>
  );
}
