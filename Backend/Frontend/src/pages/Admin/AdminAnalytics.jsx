import React from "react";

export default function AdminAnalytics() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Reports & Analytics</h2>
        <div style={styles.actions}>
          <button style={styles.btn}>📥 Export PDF</button>
          <button style={styles.btn}>📊 Export Excel</button>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Issue Trends</h3>
          <div style={styles.placeholderChart}>
            [Line Chart: Complaints over last 6 months]
          </div>
        </div>
        <div style={styles.card}>
          <h3>Geographic Heatmap</h3>
          <div style={styles.placeholderMap}>
            [GIS Map Integration: Hotspots of complaints]
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1000px", margin: "24px auto", padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  actions: { display: "flex", gap: "12px" },
  btn: { padding: "8px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", color: "var(--text)" },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: "24px" },
  card: { background: "var(--card)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" },
  placeholderChart: { height: "200px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", borderRadius: "8px", marginTop: "16px" },
  placeholderMap: { height: "300px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369a1", borderRadius: "8px", marginTop: "16px", border: "1px dashed #0ea5e9" }
};