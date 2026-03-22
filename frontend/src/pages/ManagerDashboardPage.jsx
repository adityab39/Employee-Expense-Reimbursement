import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ExpenseTable from "../components/ExpenseTable";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import api from "../services/api";

const views = {
  total: {
    title: "Total Expenses",
    matcher: () => true,
  },
  pending: {
    title: "Pending Review",
    matcher: (expense) => expense.status === "pending",
  },
  approved: {
    title: "Total Approved",
    matcher: (expense) => expense.status === "approved",
  },
  rejected: {
    title: "Total Rejected",
    matcher: (expense) => expense.status === "rejected",
  },
};

export default function ManagerDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("pending");

  useEffect(() => {
    async function loadManagerData() {
      try {
        const [dashboardResponse, expensesResponse] = await Promise.all([
          api.get("/dashboard/"),
          api.get("/expenses/"),
        ]);
        setDashboard(dashboardResponse.data);
        setAllExpenses(expensesResponse.data.results || []);
      } finally {
        setLoading(false);
      }
    }

    loadManagerData();
  }, []);

  if (loading) {
    return <div className="screen-message">Loading manager dashboard...</div>;
  }

  const filteredExpenses = allExpenses.filter(views[activeView].matcher);

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow="Manager View"
        actions={
          <Link className="primary-button" to="/manager/pending">
            Review pending
          </Link>
        }
      />

      <section className="stats-grid">
        <StatCard
          label="Total visible expenses"
          value={dashboard?.total_expenses ?? 0}
          onClick={() => setActiveView("total")}
          isActive={activeView === "total"}
        />
        <StatCard
          label="Pending review"
          value={dashboard?.pending_count ?? 0}
          tone="pending"
          onClick={() => setActiveView("pending")}
          isActive={activeView === "pending"}
        />
        <StatCard
          label="Approved"
          value={dashboard?.approved_count ?? 0}
          tone="approved"
          onClick={() => setActiveView("approved")}
          isActive={activeView === "approved"}
        />
        <StatCard
          label="Rejected"
          value={dashboard?.rejected_count ?? 0}
          tone="rejected"
          onClick={() => setActiveView("rejected")}
          isActive={activeView === "rejected"}
        />
      </section>

      <section className="hero-card">
        <span className="eyebrow">Current exposure</span>
        <h3>${dashboard?.total_amount ?? "0.00"}</h3>
        <p>Total value of the expenses currently available in the system.</p>
      </section>

      <section>
        <PageHeader eyebrow={views[activeView].title} />
        <ExpenseTable expenses={filteredExpenses} showEmployee />
      </section>
    </div>
  );
}
