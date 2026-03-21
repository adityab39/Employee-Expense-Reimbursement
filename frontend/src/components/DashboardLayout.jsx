import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const employeeNav = [
  { label: "Overview", to: "/dashboard", icon: "◫" },
  { label: "My Expenses", to: "/expenses", icon: "≣" },
  { label: "Submit Expense", to: "/expenses/new", icon: "＋" },
];

const managerNav = [
  { label: "Manager Overview", to: "/manager/dashboard", icon: "◇" },
  { label: "Pending Approvals", to: "/manager/pending", icon: "↗" },
];

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navItems =
    user?.role === "manager" || user?.role === "admin"
      ? [...employeeNav, ...managerNav]
      : employeeNav;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand-block">
          <div className="brand-mark">ER</div>
          <div>
            <h1>Expense Desk</h1>
            <p className="sidebar-copy">Track approvals with clarity</p>
          </div>
        </div>

        <nav className="nav-stack">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Workspace</span>
            <h2 className="topbar-title">Dashboard</h2>
          </div>

          <div className="profile-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="profile-trigger"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <div className="profile-avatar">
                {(user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
              </div>
              <div className="profile-copy">
                <strong>{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}</strong>
                <span>{user?.role}</span>
              </div>
              <span className="profile-chevron">⌄</span>
            </button>

            {menuOpen ? (
              <div className="profile-dropdown">
                <button type="button" className="profile-dropdown-item" onClick={handleLogout}>
                  <span>⇢</span>
                  <span>Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
