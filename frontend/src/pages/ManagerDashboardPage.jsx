import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ExpenseTable from "../components/ExpenseTable";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import api from "../services/api";

export default function ManagerDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManagerData() {
      try {
        const [dashboardResponse, pendingResponse] = await Promise.all([
          api.get("/dashboard/"),
          api.get("/expenses/pending/"),
        ]);
        setDashboard(dashboardResponse.data);
        setPendingExpenses(pendingResponse.data.results || []);
      } finally {
        setLoading(false);
      }
    }

    loadManagerData();
  }, []);

  if (loading) {
    return <div className="screen-message">Loading manager dashboard...</div>;
  }

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow="Manager Command View"
        title="See what needs a decision today"
        description="Focus on pending approvals, keep reimbursement velocity healthy, and review supporting documentation."
        actions={
          <Link className="primary-button" to="/manager/pending">
            Review pending
          </Link>
        }
      />

      <section className="stats-grid">
        <StatCard label="Total visible expenses" value={dashboard?.total_expenses ?? 0} />
        <StatCard label="Pending review" value={dashboard?.pending_count ?? 0} tone="pending" />
        <StatCard label="Approved" value={dashboard?.approved_count ?? 0} tone="approved" />
        <StatCard label="Rejected" value={dashboard?.rejected_count ?? 0} tone="rejected" />
      </section>

      <section className="hero-card">
        <span className="eyebrow">Current exposure</span>
        <h3>${dashboard?.total_amount ?? "0.00"}</h3>
        <p>Total value of the expenses currently available in the system.</p>
      </section>

      <section>
        <PageHeader
          title="Latest pending approvals"
          description="Jump straight into the newest requests requiring manager action."
        />
        <ExpenseTable expenses={pendingExpenses.slice(0, 5)} showEmployee />
      </section>
    </div>
  );
}
