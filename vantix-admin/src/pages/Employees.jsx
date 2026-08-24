import React, { useEffect, useState } from "react";
import api from "../utils/api";

function StatCard({ title, value, hint, icon, theme, hintColor }) {
  return (
    <section className={`card card--pastel-${theme}`} style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className={`icon--${theme}`}>
          {icon}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
          {value}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>{title}</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: hintColor, padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.4)' }}>{hint}</div>
      </div>
    </section>
  );
}

const Employees = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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

  const handleToggleAccess = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/users/${userId}/toggle-access`);
      if (res.data.success) {
        setSuccess(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle access');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEmployeeEmail) return;
    try {
      const res = await api.post('/users', { email: newEmployeeEmail, role: 'employee' });
      if (res.data.success) {
        setSuccess(`Employee added! They can login to the extension with password: Password123`);
        setShowAddModal(false);
        setNewEmployeeEmail('');
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add employee');
    }
  };

  const onlineCount = users.filter(u => u.isOnline).length;

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Quick Stats */}
      <div className="grid grid--3">
        <StatCard
          title="Total Employees"
          value={users.length}
          hint="+5.2% ↗"
          hintColor="#16A34A"
          theme="blue"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
        />
        <StatCard
          title="Currently Online"
          value={onlineCount}
          hint="Active now"
          hintColor="#8A7BF3"
          theme="purple"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
        />
        <StatCard
          title="Admins"
          value={users.filter(u => u.role === 'admin').length}
          hint="No change"
          hintColor="var(--text-secondary)"
          theme="green"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
        />
      </div>

      {/* Main Table */}
      <section className="card">
        <div className="card__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="card__title">Employee Directory</p>
            {success && <div className="toast toast--ok" style={{ marginTop: 12 }}>{success}</div>}
            {error && <div className="toast toast--err" style={{ marginTop: 12 }}>{error}</div>}
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 6 }}>
              Employees can be added manually here or auto-onboarded when they login via extension.
            </div>
          </div>
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)} style={{ borderRadius: 999 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>
            Add Employee
          </button>
        </div>
        <div className="card__body">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Active Platform</th>
                <th>Agent Access</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 500 }}>{user.email}</td>
                  <td>
                    <select
                      className="input"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      style={{
                        padding: "4px 10px",
                        fontSize: 12,
                        height: 30,
                        borderRadius: 6,
                        cursor: "pointer",
                        minWidth: 90,
                        color: user.role === "admin" ? "#25E6D9" : "var(--text-primary)",
                        fontWeight: user.role === "admin" ? 600 : 400,
                      }}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: user.isOnline ? "#2EE59D" : "#FF4D6D",
                        boxShadow: user.isOnline ? "0 0 8px rgba(46,229,157,0.5)" : "none",
                      }} />
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                        {user.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {user.isOnline && user.currentApp ? (
                      <span className="badge badge--admin" style={{ fontSize: 11, padding: '3px 10px' }}>{user.currentApp}</span>
                    ) : (
                      <span style={{ fontSize: 13, color: "var(--muted-text)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={`btn ${user.isAuthorized ? "btn--ghost" : "btn--danger"}`}
                      type="button"
                      style={{ fontSize: 11, padding: "4px 10px", height: 28, borderRadius: 6 }}
                      onClick={() => handleToggleAccess(user._id)}
                    >
                      {user.isAuthorized ? "Revoke" : "Grant"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn--danger"
                      type="button"
                      style={{ fontSize: 11, padding: "4px 10px", height: 28, borderRadius: 6 }}
                      onClick={() => setConfirmDelete(user)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: "var(--empty-state-text)" }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: 8 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    </svg>
                    <br/><span style={{ fontSize: 13 }}>No users found</span>
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: "var(--empty-state-text)" }}>
                    <div style={{ width: 20, height: 20, border: '2px solid var(--border-color)', borderTopColor: '#25E6D9', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
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
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="card modal-content" style={{ maxWidth: 440, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="card__head">
              <p className="card__title" style={{ color: '#FF4D6D' }}>Confirm Removal</p>
            </div>
            <div className="card__body">
              <p style={{ color: "var(--muted-text)", marginBottom: 20, lineHeight: 1.6, fontSize: 14 }}>
                Are you sure you want to remove <strong style={{ color: "var(--text-primary)" }}>{confirmDelete.email}</strong>?
                This action cannot be undone. Their violation history will be preserved.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn--ghost" type="button" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button className="btn btn--danger" type="button" onClick={() => handleDeleteUser(confirmDelete._id)}>
                  Remove user
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setError(''); setNewEmployeeEmail(''); }}>
          <div className="card modal-content" style={{ maxWidth: 440, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="card__head">
              <p className="card__title">Add New Employee</p>
            </div>
            <div className="card__body">
              <p style={{ color: "var(--muted-text)", marginBottom: 20, fontSize: 13, lineHeight: 1.5 }}>
                Enter the employee's email address. They will be prompted to set a password upon first login.
              </p>
              <form onSubmit={handleAddEmployee} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  type="email"
                  className="input"
                  placeholder="employee@yourcompany.com"
                  value={newEmployeeEmail}
                  onChange={(e) => setNewEmployeeEmail(e.target.value)}
                  required
                  autoFocus
                />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
                  <button type="button" className="btn btn--ghost" onClick={() => { setShowAddModal(false); setError(''); setNewEmployeeEmail(''); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary">
                    Invite Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
