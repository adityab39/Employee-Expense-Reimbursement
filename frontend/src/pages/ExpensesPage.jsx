import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ExpenseTable from "../components/ExpenseTable";
import PageHeader from "../components/PageHeader";
import api from "../services/api";

const filters = ["all", "pending", "approved", "rejected"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function loadExpenses() {
      setLoading(true);
      try {
        const endpoint =
          activeFilter === "all" ? "/expenses/" : `/expenses/?status=${activeFilter}`;
        const { data } = await api.get(endpoint);
        setExpenses(data.results || []);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, [activeFilter]);

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow="Expense Library"
        title="Every claim, all in one view"
        description="Filter by status, review receipt links, and jump into any submission."
        actions={
          <Link className="primary-button" to="/expenses/new">
            Add expense
          </Link>
        }
      />

      <div className="filter-row">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? "filter-pill active" : "filter-pill"}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? <div className="screen-message">Loading expenses...</div> : <ExpenseTable expenses={expenses} />}
    </div>
  );
}
