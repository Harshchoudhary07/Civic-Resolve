import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from '../../context/AuthContext';

export default function CategoryManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      // No token needed for public GET
      const res = await fetch(\/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(\/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategoryName, description: newCategoryDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => [...prev, data]);
        setNewCategoryName('');
        setNewCategoryDesc('');
        alert('Category added successfully!');
      } else {
        throw new Error(data.message || 'Failed to add category');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div style={styles.message}>Loading categories...</div>;
  if (error && !isAdding) return <div style={{ ...styles.message, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Category Management</h2>
      </div>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Add New Category</h3>
          <form onSubmit={handleAddCategory} style={styles.form}>
            <input 
              style={styles.input} 
              placeholder="Category Name" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <textarea 
              style={styles.textarea} 
              placeholder="Description"
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
            />
            {error && isAdding && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <button type="submit" className="primary-btn" disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h3>Existing Categories</h3>
          <ul style={styles.list}>
            {categories.map(cat => (
              <li key={cat._id} style={styles.listItem}>
                <strong>{cat.name}</strong>
                <p style={styles.muted}>{cat.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  message: { textAlign: 'center', marginTop: '20px' },
  container: { maxWidth: "1200px", margin: "auto", padding: "24px" },
  header: { marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' },
  card: { background: 'var(--card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', minHeight: '80px', color: 'var(--text)' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { padding: '12px 0', borderBottom: '1px solid var(--border)' },
  muted: { color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0 0' },
};