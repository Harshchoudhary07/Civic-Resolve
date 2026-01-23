import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, action, confirmMessage, successMessage, stateUpdater) => {
    if (!window.confirm(confirmMessage)) return;
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(stateUpdater);
        alert(successMessage);
      } else {
        throw new Error(data.message || `Failed to ${action} user`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = (userId) => {
    updateUserStatus(
      userId,
      'approve',
      'Are you sure you want to approve this official?',
      'User approved successfully!',
      (prevUsers) => prevUsers.map(u => u._id === userId ? { ...u, role: 'official', isActive: true } : u)
    );
  };

  const handleDeactivate = (userId) => {
    updateUserStatus(
      userId,
      'deactivate',
      'Are you sure you want to deactivate this user? Their access will be revoked immediately.',
      'User deactivated successfully!',
      (prevUsers) => prevUsers.map(u => u._id === userId ? { ...u, isActive: false } : u)
    );
  };

  const handleActivate = (userId) => {
    updateUserStatus(
      userId,
      'activate',
      'Are you sure you want to activate this user? Their access will be restored.',
      'User activated successfully!',
      (prevUsers) => prevUsers.map(u => u._id === userId ? { ...u, isActive: true } : u)
    );
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'pending') return u.role === 'pending_official';
    return u.role === filter;
  });

  if (loading) return <div style={styles.message}>Loading users...</div>;
  if (error) return <div style={{ ...styles.message, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <h2>User Management</h2>
      <div style={styles.filters}>
        <button onClick={() => setFilter('all')} style={filter === 'all' ? styles.activeFilter : styles.filterBtn}>All</button>
        <button onClick={() => setFilter('admin')} style={filter === 'admin' ? styles.activeFilter : styles.filterBtn}>Admins</button>
        <button onClick={() => setFilter('official')} style={filter === 'official' ? styles.activeFilter : styles.filterBtn}>Officials</button>
        <button onClick={() => setFilter('citizen')} style={filter === 'citizen' ? styles.activeFilter : styles.filterBtn}>Citizens</button>
        <button onClick={() => setFilter('pending')} style={filter === 'pending' ? styles.activeFilter : styles.filterBtn}>Pending Approval</button>
      </div>
      <div style={styles.listContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u._id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>
                    <span style={u.isActive ? styles.active : styles.inactive}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {u.role === 'pending_official' && (
                        <button onClick={() => handleApprove(u._id)} style={styles.approveBtn}>Approve</button>
                      )}
                      {u.isActive && u.role !== 'admin' && (
                        <button onClick={() => handleDeactivate(u._id)} style={styles.deactivateBtn}>Deactivate</button>
                      )}
                      {!u.isActive && u.role !== 'admin' && (
                        <button onClick={() => handleActivate(u._id)} style={styles.activateBtn}>Activate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No users found for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  message: { textAlign: 'center', marginTop: '20px' },
  container: { maxWidth: "1200px", margin: "auto", padding: "24px" },
  filters: { display: 'flex', gap: '10px', marginBottom: '20px' },
  filterBtn: { padding: '8px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text)' },
  activeFilter: { padding: '8px 16px', background: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '8px', cursor: 'pointer', color: '#fff' },
  listContainer: { background: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)", overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  td: { padding: '12px 16px', borderBottom: '1px solid var(--border)' },
  active: { color: '#16a34a', fontWeight: '500' },
  inactive: { color: '#ef4444', fontWeight: '500' },
  approveBtn: { padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  activateBtn: { padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  deactivateBtn: { padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};