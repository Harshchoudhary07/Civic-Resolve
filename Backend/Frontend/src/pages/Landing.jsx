import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { 
  HiBuildingLibrary, 
  HiRocketLaunch, 
  HiDocumentText, 
  HiArrowPath, 
  HiChartBar, 
  HiCheckCircle, 
  HiLockClosed, 
  HiBolt 
} from 'react-icons/hi2';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect them to their respective dashboard
    if (user) {
      if (user.role === 'citizen') navigate('/citizen/home');
      else if (user.role === 'official') navigate('/official/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={styles.wrapper}>
      {/* Hero Section */}
      <section className="hero-gradient" style={styles.hero}>
        <div style={styles.heroContent}>
          {/* Government Emblem */}
          <div style={styles.emblem}>
            <div style={styles.emblemCircle}><HiBuildingLibrary /></div>
          </div>

          <h1 style={styles.title}>CivicResolve</h1>
          <p style={styles.subtitle}>Government Complaint Redressal Portal</p>
          <p style={styles.tagline}>
            Report civic issues. Track resolution. Hold systems accountable.
          </p>

          {/* Primary CTA */}
          <div style={styles.ctaGroup}>
            <Link to="/citizen/login" style={{ textDecoration: 'none' }}>
              <button className="btn-gradient-cta" style={styles.primaryCta}>
                <HiRocketLaunch style={{ display: 'inline', marginRight: '8px' }} />
                Get Started as Citizen
              </button>
            </Link>
            <Link to="/citizen/register" style={{ textDecoration: 'none' }}>
              <button className="btn-gradient-secondary" style={styles.secondaryCta}>
                Register New Account
              </button>
            </Link>
          </div>

          {/* Official/Admin Login Links */}
          <div style={styles.officialLinks}>
            <Link to="/official/login" style={styles.link}>Official Login</Link>
            <span style={styles.separator}>•</span>
            <Link to="/admin/login" style={styles.link}>Admin Login</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.featureGrid}>
            <div className="card-gradient-hover" style={styles.featureCard}>
              <div style={styles.featureIcon}><HiDocumentText /></div>
              <h3 style={styles.featureTitle}>File Complaint</h3>
              <p style={styles.featureText}>
                Submit complaints with photos/videos. Track status in real-time with unique ticket ID.
              </p>
            </div>

            <div className="card-gradient-hover" style={styles.featureCard}>
              <div style={styles.featureIcon}><HiArrowPath /></div>
              <h3 style={styles.featureTitle}>Auto Escalation</h3>
              <p style={styles.featureText}>
                Complaints automatically escalate to higher authorities if not resolved within timeframe.
              </p>
            </div>

            <div className="card-gradient-hover" style={styles.featureCard}>
              <div style={styles.featureIcon}><HiChartBar /></div>
              <h3 style={styles.featureTitle}>Track Progress</h3>
              <p style={styles.featureText}>
                View detailed timeline, officer details, and receive SMS/email notifications at each step.
              </p>
            </div>

            <div className="card-gradient-hover" style={styles.featureCard}>
              <div style={styles.featureIcon}><HiCheckCircle /></div>
              <h3 style={styles.featureTitle}>Transparency</h3>
              <p style={styles.featureText}>
                Complete visibility into escalation levels, officer assignments, and resolution process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.stats}>
        <div style={styles.container}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>10K+</div>
              <div style={styles.statLabel}>Complaints Filed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>85%</div>
              <div style={styles.statLabel}>Resolution Rate</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>24/7</div>
              <div style={styles.statLabel}>Support Available</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>100%</div>
              <div style={styles.statLabel}>Transparent Process</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={styles.trust}>
        <div style={styles.container}>
          <div style={styles.trustBadges}>
            <div style={styles.badge}>
              <span style={styles.badgeIcon}><HiLockClosed /></span>
              <span style={styles.badgeText}>Secure & Encrypted</span>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeIcon}>🇮🇳</span>
              <span style={styles.badgeText}>Government Verified</span>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeIcon}><HiBolt /></span>
              <span style={styles.badgeText}>Fast Resolution</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  hero: {
    background: 'linear-gradient(135deg, #003366 0%, #1e40af 50%, #3b82f6 100%)',
    padding: '4rem 1rem',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  emblem: {
    marginBottom: '1.5rem',
  },
  emblemCircle: {
    width: '100px',
    height: '100px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    backdropFilter: 'blur(10px)',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    fontSize: '1.25rem',
    fontWeight: '500',
    marginBottom: '1rem',
    opacity: 0.95,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  tagline: {
    fontSize: '1.125rem',
    marginBottom: '2.5rem',
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
  },
  ctaGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  primaryCta: {
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #FF9933 0%, #f59e0b 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(255, 153, 51, 0.4)',
    transition: 'all 0.3s ease',
  },
  secondaryCta: {
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
  officialLinks: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.9375rem',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  features: {
    padding: '4rem 1rem',
    background: 'var(--bg)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '3rem',
    color: 'var(--text)',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    background: 'var(--card)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--shadow-sm)',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: 'var(--text)',
  },
  featureText: {
    fontSize: '0.9375rem',
    color: 'var(--muted)',
    lineHeight: '1.6',
  },
  stats: {
    padding: '3rem 1rem',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  },
  statCard: {
    textAlign: 'center',
    color: 'white',
  },
  statValue: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '1rem',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  trust: {
    padding: '3rem 1rem',
    background: 'var(--bg)',
  },
  trustBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
  },
  badgeIcon: {
    fontSize: '1.5rem',
  },
  badgeText: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text)',
  },
};
