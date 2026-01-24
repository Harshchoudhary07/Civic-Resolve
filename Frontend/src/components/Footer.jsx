import React from "react";
import { Link } from "react-router-dom";
import {
  HiBuildingLibrary,
  HiLockClosed,
  HiPhone,
  HiEnvelope,
  HiClock,
  HiUsers
} from 'react-icons/hi2';
import { FaTwitter, FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Government Branding */}
        <div style={styles.section}>
          <div style={styles.logoSection}>
            <div style={styles.emblem}><HiBuildingLibrary /></div>
            <h3 style={styles.heading}>CivicResolve</h3>
          </div>
          <p style={styles.text}>
            Government of India Initiative<br />
            Empowering citizens to report issues, track resolutions, and hold systems accountable.
            Together for a better community.
          </p>
          <div style={styles.badge}>
            <span style={styles.badgeIcon}><HiLockClosed /></span>
            <span style={styles.badgeText}>Secure & Verified Platform</span>
          </div>
        </div>

        {/* Quick Links */}
        <div style={styles.section}>
          <h4 style={styles.subHeading}>Quick Links</h4>
          <div style={styles.links}>
            <Link to="/citizen/login" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Citizen Portal</Link>
            <Link to="/official/login" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Official Portal</Link>
            <Link to="/admin/login" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Admin Portal</Link>
            <a href="#about" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>About Us</a>
            <a href="#faq" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>FAQ</a>
          </div>
        </div>

        {/* Contact Information */}
        <div style={styles.section}>
          <h4 style={styles.subHeading}>Contact & Support</h4>
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <span style={styles.icon}><HiPhone /></span>
              <div>
                <div style={styles.contactLabel}>Helpline</div>
                <div style={styles.contactValue}>1800-XXX-XXXX</div>
              </div>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.icon}><HiEnvelope /></span>
              <div>
                <div style={styles.contactLabel}>Email</div>
                <div style={styles.contactValue}>support@civicresolve.gov.in</div>
              </div>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.icon}><HiClock /></span>
              <div>
                <div style={styles.contactLabel}>Working Hours</div>
                <div style={styles.contactValue}>Mon-Fri: 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Resources */}
        <div style={styles.section}>
          <h4 style={styles.subHeading}>Connect With Us</h4>
          <div style={styles.socialLinks}>
            <a href="#twitter" style={styles.socialIcon} title="Twitter"><FaTwitter /></a>
            <a href="#facebook" style={styles.socialIcon} title="Facebook"><FaFacebook /></a>
            <a href="#youtube" style={styles.socialIcon} title="YouTube"><FaYoutube /></a>
            <a href="#instagram" style={styles.socialIcon} title="Instagram"><FaInstagram /></a>
          </div>
          <div style={styles.links}>
            <a href="#accessibility" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Accessibility Statement</a>
            <a href="#privacy" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Privacy Policy</a>
            <a href="#terms" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Terms of Service</a>
            <a href="#sitemap" style={styles.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Sitemap</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomContainer}>
          <div style={styles.copyright}>
            © {new Date().getFullYear()} CivicResolve - Government of India. All rights reserved.
          </div>
          <div style={styles.metadata}>
            <span style={styles.metaItem}>Last Updated: {new Date().toLocaleDateString('en-IN')}</span>
            <span style={styles.metaItem}>|</span>
            <span style={styles.metaItem}><HiUsers style={{ display: 'inline', marginRight: '4px' }} />Visitors: 1,234,567</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: "var(--card)",
    borderTop: "3px solid var(--gov-saffron)",
    marginTop: "60px"
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 24px 32px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "40px"
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px"
  },
  emblem: {
    fontSize: "32px",
    lineHeight: 1
  },
  heading: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--gov-blue-dark)"
  },
  subHeading: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px"
  },
  text: {
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    fontSize: "14px",
    margin: 0
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--gov-green)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    width: "fit-content"
  },
  badgeIcon: {
    fontSize: "14px"
  },
  badgeText: {
    margin: 0
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  link: {
    color: "var(--primary)",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.2s ease",
    cursor: "pointer"
  },
  contactInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  contactItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px"
  },
  icon: {
    fontSize: "20px",
    lineHeight: 1
  },
  contactLabel: {
    fontSize: "12px",
    color: "var(--muted)",
    marginBottom: "2px"
  },
  contactValue: {
    fontSize: "14px",
    color: "var(--text)",
    fontWeight: "500"
  },
  socialLinks: {
    display: "flex",
    gap: "12px",
    marginBottom: "8px"
  },
  socialIcon: {
    fontSize: "24px",
    textDecoration: "none",
    transition: "transform 0.2s ease",
    cursor: "pointer",
    display: "inline-block"
  },
  bottomBar: {
    background: "var(--bg-secondary)",
    borderTop: "1px solid var(--border)",
    padding: "20px 24px"
  },
  bottomContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px"
  },
  copyright: {
    color: "var(--muted)",
    fontSize: "13px"
  },
  metadata: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "13px",
    color: "var(--muted)"
  },
  metaItem: {
    whiteSpace: "nowrap"
  }
};