import React, { useEffect, useState } from "react";
import api from "../utils/api";

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // user obj to delete

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if(res.data.success) setUsers(res.data.users);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  const handleDeleteUser = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.data.success) {
        setSuccess(res.data.message);
        setConfirmDelete(null);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove user');
      setConfirmDelete(null);
    }
  };

  const handleRoleChange = async (userId, newRoleValue) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/users/${userId}`, { role: newRoleValue });
      if (res.data.success) {
        setSuccess(`Role updated to ${newRoleValue}`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleAccessToggle = async (userId, newStatus) => {
    try {
      const res = await api.patch(`/users/${userId}`, { accessStatus: newStatus });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to toggle access', err);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <section className="card">
        <div className="card__head">
          <p className="card__title">Employee Directory</p>
          <div className="card__description" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>
            Employees are automatically onboarded when they login through the Chrome extension using their company email domain.
          </div>
        </div>
        <div className="card__body">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Live Status</th>
                <th>Platform</th>
                <th>Access</th>
                <th>Added</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isOnline = user.lastSeenAt && (Date.now() - new Date(user.lastSeenAt).getTime() < 5 * 60 * 1000);
                const isRevoked = user.accessStatus === "revoked";

                return (
                  <tr key={user._id} style={{ opacity: isRevoked ? 0.6 : 1 }}>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="select"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          fontSize: 12,
                          background: "var(--input-inline-bg)",
                          border: "1px solid var(--input-inline-border)",
                          borderRadius: 6,
                          color: user.role === "admin" ? "#25E6D9" : "var(--input-inline-color)",
                          cursor: "pointer",
                          minWidth: 90,
                        }}
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: "50%", 
                          background: isOnline ? "#2EE59D" : "#666",
                          boxShadow: isOnline ? "0 0 8px #2EE59D" : "none"
                        }} />
                        <span style={{ fontSize: 12, color: isOnline ? "var(--text-primary)" : "var(--text-secondary)" }}>
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--brand-2)" }}>
                      {user.lastSeenPlatform || "—"}
                    </td>
                    <td>
                      <button
                        className={`btn ${isRevoked ? "btn--primary" : "btn--danger"}`}
                        onClick={() => handleAccessToggle(user._id, isRevoked ? "granted" : "revoked")}
                        style={{ fontSize: 11, padding: "4px 10px", height: "auto" }}
                      >
                        {isRevoked ? "Grant Access" : "Revoke"}
                      </button>
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn--ghost"
                        type="button"
                        style={{ fontSize: 12, padding: "4px 12px", height: "auto", borderColor: "rgba(255,77,109,.3)" }}
                        onClick={() => setConfirmDelete(user)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--empty-state-text)" }}>
                    No users found
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--empty-state-text)" }}>
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 420, margin: "auto", animation: "fadeIn 0.15s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card__head">
              <p className="card__title">Confirm removal</p>
            </div>
            <div className="card__body">
              <p style={{ color: "var(--muted-text)", marginBottom: 16, lineHeight: 1.5 }}>
                Are you sure you want to remove <strong style={{ color: "var(--text-primary)" }}>{confirmDelete.email}</strong>?
                This action cannot be undone. Their violation history will be preserved.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn--danger"
                  type="button"
                  onClick={() => handleDeleteUser(confirmDelete._id)}
                >
                  Remove user
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
