import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newDept, setNewDept] = useState({ name: '', description: '', slaHours: 48 });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/admin/departments`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDepartments(data.data);
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/admin/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newDept)
            });
            if (res.ok) {
                alert('Department Created');
                setNewDept({ name: '', description: '', slaHours: 48 });
                fetchDepartments();
            } else {
                const err = await res.json();
                alert('Error: ' + err.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            <h2>Department Management</h2>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3>Create Department</h3>
                    <form onSubmit={handleCreate} style={styles.form}>
                        <input
                            style={styles.input}
                            placeholder="Department Name"
                            value={newDept.name}
                            onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                            required
                        />
                        <textarea
                            style={styles.textarea}
                            placeholder="Description"
                            value={newDept.description}
                            onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                        />
                        <label>SLA (Hours)</label>
                        <input
                            style={styles.input}
                            type="number"
                            value={newDept.slaHours}
                            onChange={e => setNewDept({ ...newDept, slaHours: e.target.value })}
                        />
                        <button type="submit" style={styles.btnPrimary}>Create</button>
                    </form>
                </div>

                <div style={styles.list}>
                    {departments.map(d => (
                        <div key={d._id} style={styles.item}>
                            <h4>{d.name}</h4>
                            <p>{d.description}</p>
                            <small>SLA: {d.slaHours}h</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' },
    card: { background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' },
    textarea: { padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', minHeight: '80px' },
    btnPrimary: { padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    list: { display: 'grid', gap: '12px' },
    item: { background: 'var(--card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }
};
