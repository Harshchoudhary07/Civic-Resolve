import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ComplaintOversight() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchComplaints();
    }, [page]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/complaints?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setComplaints(data.data);
                setTotalPages(data.pages);
            } else {
                throw new Error(data.message || 'Failed to fetch complaints');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (id) => {
        const reason = prompt("Enter reason for archiving (e.g., Spam, Duplicate):");
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/complaints/${id}/archive`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason })
            });
            if (res.ok) {
                alert('Complaint archived.');
                fetchComplaints();
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleOverride = async (id) => {
        const newStatus = prompt("Enter new status (Pending, In Progress, Resolved):");
        if (!newStatus) return;
        const reason = prompt("Enter reason for override:");
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/complaints/${id}/override-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, reason })
            });
            if (res.ok) {
                alert('Status updated.');
                fetchComplaints();
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    if (loading) return <div style={styles.message}>Loading complaints...</div>;
    if (error) return <div style={{ ...styles.message, color: 'red' }}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h2>Complaint Oversight</h2>
            <div style={styles.list}>
                {complaints.map(c => (
                    <div key={c._id} style={styles.card}>
                        <div style={styles.header}>
                            <strong>#{c._id.slice(-6)}</strong>
                            <span style={styles.status}>{c.currentStatus}</span>
                        </div>
                        <h4>{c.title}</h4>
                        <p>{c.description?.substring(0, 100)}...</p>
                        <div style={styles.meta}>
                            <span>Category: {c.category}</span>
                            <span>Score: {c.priorityScore}</span>
                        </div>
                        <div style={styles.actions}>
                            <button onClick={() => handleOverride(c._id)} style={styles.btnWarn}>Override Status</button>
                            <button onClick={() => handleArchive(c._id)} style={styles.btnDanger}>Archive</button>
                        </div>
                    </div>
                ))}
            </div>
            <div style={styles.pagination}>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
        </div>
    );
}

const styles = {
    message: { textAlign: 'center', marginTop: '40px' },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '24px' },
    list: { display: 'grid', gap: '16px' },
    card: { background: 'var(--card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' },
    status: { fontWeight: 'bold', color: 'var(--primary)' },
    meta: { display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--muted)', margin: '8px 0' },
    actions: { display: 'flex', gap: '8px', marginTop: '12px' },
    btnWarn: { padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnDanger: { padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    pagination: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }
};
