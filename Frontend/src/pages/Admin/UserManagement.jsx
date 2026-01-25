import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchDepartments();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(\/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(\/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDepartments(data.data);
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm("Approve this official?")) return;
    performAction(userId, 'approve', 'PUT');
  };

  const handleBan = async (userId) => {
    const reason = prompt("Enter reason for banning:");
    if (!reason) return;
    performAction(userId, 'ban', 'PUT', { reason });
  };

  const handleActivate = async (userId) => {
    if (!window.confirm("Activate this user?")) return;
    performAction(userId, 'activate', 'PUT');
  };

  const handleAssignDept = async (userId, deptName) => {
    if (!deptName) return;
    if (!window.confirm(`Assign specific to ${deptName}?`)) return;
    performAction(userId, 'assign-department', 'PUT', { department: deptName });
  };

  const performAction = async (userId, action, method, body = {}) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/${action}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Success');
        fetchUsers();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'pending') return u.role === 'pending_official';
    return u.role === filter;
  });

  if (loading) return <div style={styles.message}>Loading users...</div>;

  return (
    <div style={styles.container}>
      <h2>User Management</h2>
      <div style={styles.filters}>
        {['all', 'admin', 'official', 'citizen', 'pending'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={filter === f ? styles.activeFilter : styles.filterBtn}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.listContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Dept</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>
                  {u.role === 'official' ? (
                    <select
                      value={u.department || ''}
                      onChange={(e) => handleAssignDept(u._id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Select Dept</option>
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  ) : '-'}
                </td>
                <td style={styles.td}>
                  <span style={u.isActive ? styles.active : styles.inactive}>
                    {u.isActive ? 'Active' : 'Banned/Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {u.role === 'pending_official' && (
                      <button onClick={() => handleApprove(u._id)} style={styles.approveBtn}>Approve</button>
                    )}
                    {u.isActive && u.role !== 'admin' && (
                      <button onClick={() => handleBan(u._id)} style={styles.deactivateBtn}>Ban</button>
                    )}
                    {!u.isActive && u.role !== 'pending_official' && u.role !== 'admin' && (
                      <button onClick={() => handleActivate(u._id)} style={styles.activateBtn}>Activate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
  th: { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' },
  td: { padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text)' },
  active: { color: '#16a34a', fontWeight: '500' },
  inactive: { color: '#ef4444', fontWeight: '500' },
  approveBtn: { padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  activateBtn: { padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  deactivateBtn: { padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  select: { padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }
};