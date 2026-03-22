import { useEffect, useState } from "react";
import ExpenseTable from "../components/ExpenseTable";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import api from "../services/api";

export default function UserDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardResponse, expensesResponse] = await Promise.all([
          api.get("/dashboard/"),
          api.get("/expenses/"),
        ]);

        setDashboard(dashboardResponse.data);
        setExpenses(expensesResponse.data.results || []);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="screen-message">Loading your dashboard...</div>;
  }

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow="Employee Overview"
      />

      <section className="stats-grid">
        <StatCard label="Total expenses" value={dashboard?.total_expenses ?? 0} />
        <StatCard label="Pending" value={dashboard?.pending_count ?? 0} tone="pending" />
        <StatCard label="Approved" value={dashboard?.approved_count ?? 0} tone="approved" />
        <StatCard label="Rejected" value={dashboard?.rejected_count ?? 0} tone="rejected" />
      </section>

      <section className="split-panel">
        <div className="hero-card">
          <span className="eyebrow">Reimbursable total</span>
          <h3>${dashboard?.total_amount ?? "0.00"}</h3>
          <p>Based on all currently submitted expenses visible to your account.</p>
        </div>
      </section>

      <section>
        <PageHeader
          title="Recent submissions"
          description="A quick look at your latest expense activity."
        />
        <ExpenseTable expenses={expenses.slice(0, 5)} />
      </section>
    </div>
  );
}
