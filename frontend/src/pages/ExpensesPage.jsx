import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ExpenseTable from "../components/ExpenseTable";
import PageHeader from "../components/PageHeader";
import api from "../services/api";

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  async function loadExpenses(selectedFilter = activeFilter) {
    setLoading(true);
    try {
      const endpoint = selectedFilter === "all" ? "/expenses/" : `/expenses/?status=${selectedFilter}`;
      const { data } = await api.get(endpoint);
      setExpenses(data.results || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [activeFilter]);

  return (
    <div className="content-stack">
      <PageHeader
        eyebrow="Expense Library"
        actions={
          <Link className="primary-button" to="/expenses/new">
            Add expense
          </Link>
        }
      />

      <div className="filter-row">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={activeFilter === filter.value ? "filter-pill active" : "filter-pill"}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="screen-message">Loading expenses...</div>
      ) : (
        <ExpenseTable expenses={expenses} />
      )}
    </div>
  );
}
