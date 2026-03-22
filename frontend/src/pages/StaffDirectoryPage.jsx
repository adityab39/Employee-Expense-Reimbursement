import { useEffect, useMemo, useState } from "react";

import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function getInitialRole(staffMember) {
  return staffMember?.role ?? "employee";
}

function getInitialManager(staffMember) {
  return staffMember?.manager ?? "";
}

function getErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;
  if (!data) {
    return fallbackMessage;
  }
  if (typeof data.detail === "string") {
    return data.detail;
  }
  const firstError = Object.values(data)[0];
  if (Array.isArray(firstError) && firstError[0]) {
    return firstError[0];
  }
  return fallbackMessage;
}

export default function StaffDirectoryPage() {
  const { user } = useAuth();
  const [staffMembers, setStaffMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStaffId, setActiveStaffId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("employee");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = user?.role === "admin";

  async function loadStaffDirectory(nextActiveId = activeStaffId) {
    setLoading(true);
    try {
      const requests = [api.get("/auth/staff-directory/")];
      if (isAdmin) {
        requests.push(api.get("/auth/managers/"));
      }

      const [staffResponse, managersResponse] = await Promise.all(requests);
      const nextStaffMembers = staffResponse.data;

      setStaffMembers(nextStaffMembers);
      if (isAdmin) {
        setManagers(managersResponse?.data || []);
      }

      if (nextActiveId) {
        const refreshedActiveStaff = nextStaffMembers.find((member) => member.id === nextActiveId);
        if (refreshedActiveStaff) {
          setActiveStaffId(refreshedActiveStaff.id);
          setSelectedRole(getInitialRole(refreshedActiveStaff));
          setSelectedManagerId(getInitialManager(refreshedActiveStaff));
        } else {
          setActiveStaffId(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaffDirectory(null);
  }, [isAdmin]);

  const activeStaffMember = useMemo(
    () => staffMembers.find((member) => member.id === activeStaffId) ?? null,
    [activeStaffId, staffMembers]
  );

  function openStaffPanel(staffMember) {
    setActiveStaffId(staffMember.id);
    setSelectedRole(getInitialRole(staffMember));
    setSelectedManagerId(getInitialManager(staffMember));
    setErrorMessage("");
  }

  function closeStaffPanel() {
    setActiveStaffId(null);
    setErrorMessage("");
  }

  async function handleSaveChanges() {
    if (!activeStaffMember) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      await api.patch(`/auth/employees/${activeStaffMember.id}/`, {
        role: selectedRole,
        manager_id: selectedRole === "employee" ? Number(selectedManagerId) || null : null,
      });
      await loadStaffDirectory(null);
      closeStaffPanel();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to save staff member changes."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!activeStaffMember) {
      return;
    }

    const confirmed = window.confirm(`Delete ${activeStaffMember.full_name || activeStaffMember.email}?`);
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      await api.delete(`/auth/employees/${activeStaffMember.id}/`);
      await loadStaffDirectory(null);
      closeStaffPanel();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to delete this staff member."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-stack">
      <PageHeader eyebrow="Staff Directory" />

      {loading ? (
        <div className="screen-message">Loading staff directory...</div>
      ) : staffMembers.length ? (
        <>
          <div className="table-card directory-card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Manager</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td>{staffMember.full_name}</td>
                    <td>{staffMember.email}</td>
                    <td>
                      <span className={`directory-role-badge ${staffMember.role}`}>
                        {staffMember.role}
                      </span>
                    </td>
                    <td>{staffMember.manager_name || "No manager assigned"}</td>
                    <td className="directory-actions-cell">
                      <button
                        type="button"
                        className="ellipsis-button"
                        onClick={() => openStaffPanel(staffMember)}
                        aria-label={`Open details for ${staffMember.full_name}`}
                      >
                        ...
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeStaffMember ? (
            <div className="staff-modal-backdrop" onClick={closeStaffPanel}>
              <section className="staff-modal" onClick={(event) => event.stopPropagation()}>
                <div className="staff-modal-header">
                  <div className="staff-avatar">{activeStaffMember.full_name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <span className="eyebrow">User Information</span>
                    <h3>{activeStaffMember.full_name}</h3>
                    <p>{activeStaffMember.email}</p>
                  </div>
                  <button
                    type="button"
                    className="staff-modal-close"
                    onClick={closeStaffPanel}
                    aria-label="Close staff details"
                  >
                    x
                  </button>
                </div>

                <div className="staff-modal-grid">
                  <div>
                    <span>First Name</span>
                    <strong>{activeStaffMember.first_name || "-"}</strong>
                  </div>
                  <div>
                    <span>Last Name</span>
                    <strong>{activeStaffMember.last_name || "-"}</strong>
                  </div>
                  <div>
                    <span>Current Role</span>
                    <strong className="capitalize">{activeStaffMember.role}</strong>
                  </div>
                  <div>
                    <span>Current Manager</span>
                    <strong>{activeStaffMember.manager_name || "No manager assigned"}</strong>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="staff-admin-panel">
                    <label>
                      Role
                      <select
                        value={selectedRole}
                        onChange={(event) => {
                          setSelectedRole(event.target.value);
                          if (event.target.value === "manager") {
                            setSelectedManagerId("");
                          }
                        }}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                    </label>

                    {selectedRole === "employee" ? (
                      <label>
                        Assign Manager
                        <select
                          value={selectedManagerId}
                          onChange={(event) => setSelectedManagerId(event.target.value)}
                        >
                          <option value="">No manager assigned</option>
                          {managers
                            .filter((manager) => manager.id !== activeStaffMember.id)
                            .map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.full_name}
                              </option>
                            ))}
                        </select>
                      </label>
                    ) : (
                      <div className="staff-helper-copy">
                        Managers are not assigned to another manager. Saving will remove any current
                        manager assignment from this user.
                      </div>
                    )}

                    {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

                    <div className="button-row">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={handleSaveChanges}
                        disabled={submitting}
                      >
                        {submitting ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handleDelete}
                        disabled={submitting}
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}
        </>
      ) : (
        <div className="empty-state">
          {isAdmin ? "No staff members found yet." : "No employees are assigned to this manager yet."}
        </div>
      )}
    </div>
  );
}
