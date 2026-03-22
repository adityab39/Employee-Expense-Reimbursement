import { Link } from "react-router-dom";

import StatusBadge from "./StatusBadge";

function formatCategory(category) {
  return category
    ?.split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatEmployeeName(employee) {
  const fullName = `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim();
  return fullName || employee?.email || "-";
}

export default function ExpenseTable({ expenses, showEmployee = false }) {
  if (!expenses.length) {
    return <div className="empty-state">No expenses found yet.</div>;
  }

  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            {showEmployee ? <th>Employee</th> : null}
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.title}</td>
              {showEmployee ? <td>{formatEmployeeName(expense.employee)}</td> : null}
              <td>{formatCategory(expense.category)}</td>
              <td>${expense.amount}</td>
              <td>
                <StatusBadge status={expense.status} />
              </td>
              <td>{new Date(expense.submitted_at).toLocaleDateString()}</td>
              <td>
                <Link className="text-link" to={`/expenses/${expense.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
