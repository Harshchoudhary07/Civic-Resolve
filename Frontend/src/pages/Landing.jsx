import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import "../styles/landing-animations.css";
import {
  HiBuildingLibrary,
  HiRocketLaunch,
  HiDocumentText,
  HiArrowPath,
  HiChartBar,
  HiCheckCircle,
  HiLockClosed,
  HiBolt,
  HiUserGroup,
  HiClock,
  HiShieldCheck,
  HiBell,
  HiMapPin,
  HiCamera,
  HiChatBubbleLeftRight,
  HiChevronDown
} from 'react-icons/hi2';
import { FaTimesCircle, FaHardHat, FaLightbulb, FaTrash, FaTint } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [feedbacks, setFeedbacks] = useState([]);
  const observerRef = useRef(null);

  useEffect(() => {
    // If user is already logged in, redirect them to their respective dashboard
    if (user) {
      if (user.role === 'citizen') navigate('/citizen/home');
      else if (user.role === 'official') navigate('/official/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }

    // Fetch feedbacks
    fetch('/api/feedbacks')
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(err => console.error('Error fetching feedbacks:', err));
  }, [user, navigate]);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={styles.wrapper}>
      {/* Animated keyframes */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 153, 51, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 153, 51, 0.6); }
        }

        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .icon-hover {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .icon-hover:hover {
          transform: rotate(10deg) scale(1.1);
        }

        .marquee-container {
          overflow: hidden;
          padding: 2rem 0;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          width: 100%;
        }

        .marquee-content {
          display: flex;
          gap: 2rem;
          width: max-content;
          animation: marquee 60s linear infinite;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-gradient" style={styles.hero}>
        <div style={styles.heroContent}>
          {/* Government Emblem with parallax */}
          <div style={styles.emblem}>
            <div
              style={{
                ...styles.emblemCircle,
                transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <HiBuildingLibrary className="icon-hover" />
            </div>
          </div>

          <h1 style={styles.title}>CivicResolve</h1>
          <p style={styles.subtitle}>Government Complaint Redressal Portal</p>
          <p style={styles.tagline}>
            Empowering citizens to report civic issues, track resolutions in real-time, and hold government systems accountable through transparent, automated escalation.
          </p>

          {/* Primary CTA */}
          <div style={styles.ctaGroup}>
            <Link to="/citizen/login" style={{ textDecoration: 'none' }}>
              <button className="btn-gradient-cta btn-hover-lift" style={styles.primaryCta}>
                <HiRocketLaunch style={{ display: 'inline', marginRight: '8px' }} />
                Get Started as Citizen
              </button>
            </Link>
            <Link to="/citizen/register" style={{ textDecoration: 'none' }}>
              <button className="btn-gradient-secondary btn-hover-lift" style={styles.secondaryCta}>
                Register New Account
              </button>
            </Link>
          </div>

          {/* Official/Admin Login Links */}
          <div style={styles.officialLinks}>
            <Link to="/official/login" style={styles.link} className="link-hover">Official Login</Link>
            <span style={styles.separator}>•</span>
            <Link to="/admin/login" style={styles.link} className="link-hover">Admin Login</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.stats} className="scroll-animate">
        <div style={styles.container}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>10K+</div>
              <div style={styles.statLabel}>Complaints Resolved</div>
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

      {/* Problems vs Solutions */}
      <section style={styles.problemSolution} className="scroll-animate">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why CivicResolve?</h2>
          <p style={styles.sectionSubtitle}>
            Traditional complaint systems are broken. We're fixing them with technology and transparency.
          </p>

          <div style={styles.comparisonGrid}>
            <div className="card-gradient-hover card-hover" style={styles.comparisonCard}>
              <div style={styles.comparisonBadge}><FaTimesCircle style={{ marginRight: '6px' }} />Old System</div>
              <h3 style={styles.comparisonTitle}>The Problem</h3>
              <ul style={styles.problemList}>
                <li>Complaints get lost in bureaucracy</li>
                <li>No visibility into resolution status</li>
                <li>Manual escalation leads to delays</li>
                <li>Citizens feel powerless and ignored</li>
                <li>No accountability for officials</li>
                <li>Paper-based processes are slow</li>
              </ul>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.comparisonCard}>
              <div style={styles.comparisonBadgeSuccess}>✓ CivicResolve</div>
              <h3 style={styles.comparisonTitle}>The Solution</h3>
              <ul style={styles.solutionList}>
                <li>Every complaint tracked with unique ID</li>
                <li>Real-time status updates via SMS/Email</li>
                <li>Automatic escalation to higher authorities</li>
                <li>Complete transparency and visibility</li>
                <li>Performance metrics for all officials</li>
                <li>Digital, fast, and accessible 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorks} className="scroll-animate">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>
            A simple, transparent process from complaint to resolution
          </p>

          <div style={styles.stepsContainer}>
            <div style={styles.stepCard} className="card-hover">
              <div style={styles.stepNumber} className="step-number">1</div>
              <div style={styles.stepIcon} className="step-icon"><HiDocumentText /></div>
              <h3 style={styles.stepTitle}>File Your Complaint</h3>
              <p style={styles.stepText}>
                Register and submit your civic issue with photos, videos, and location. Choose from predefined categories like roads, water supply, sanitation, or electricity.
              </p>
            </div>

            <div style={styles.stepArrow} className="step-arrow">→</div>

            <div style={styles.stepCard} className="card-hover">
              <div style={styles.stepNumber} className="step-number">2</div>
              <div style={styles.stepIcon} className="step-icon"><HiUserGroup /></div>
              <h3 style={styles.stepTitle}>Auto-Assignment</h3>
              <p style={styles.stepText}>
                Your complaint is automatically assigned to the relevant department and official based on category, location, and current workload distribution.
              </p>
            </div>

            <div style={styles.stepArrow} className="step-arrow">→</div>

            <div style={styles.stepCard} className="card-hover">
              <div style={styles.stepNumber} className="step-number">3</div>
              <div style={styles.stepIcon} className="step-icon"><HiClock /></div>
              <h3 style={styles.stepTitle}>Track Progress</h3>
              <p style={styles.stepText}>
                Monitor your complaint status in real-time. Receive notifications at every stage: acknowledged, in-progress, resolved, or escalated.
              </p>
            </div>

            <div style={styles.stepArrow} className="step-arrow">→</div>

            <div style={styles.stepCard} className="card-hover">
              <div style={styles.stepNumber} className="step-number">4</div>
              <div style={styles.stepIcon} className="step-icon"><HiArrowPath /></div>
              <h3 style={styles.stepTitle}>Auto-Escalation</h3>
              <p style={styles.stepText}>
                If not resolved within the deadline, complaints automatically escalate to higher authorities. No manual intervention needed.
              </p>
            </div>

            <div style={styles.stepArrow} className="step-arrow">→</div>

            <div style={styles.stepCard} className="card-hover">
              <div style={styles.stepNumber} className="step-number">5</div>
              <div style={styles.stepIcon} className="step-icon"><HiCheckCircle /></div>
              <h3 style={styles.stepTitle}>Resolution & Feedback</h3>
              <p style={styles.stepText}>
                Once resolved, you'll receive confirmation with before/after photos. Rate the service and provide feedback to improve the system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features} className="scroll-animate">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Powerful Features</h2>
          <p style={styles.sectionSubtitle}>
            Everything you need for effective complaint management
          </p>

          <div style={styles.featureGrid}>
            <div className="card-gradient-hover card-hover" style={styles.featureCard}>
              <div style={styles.featureIcon} className="feature-icon"><HiCamera /></div>
              <h3 style={styles.featureTitle}>Rich Media Support</h3>
              <p style={styles.featureText}>
                Upload photos and videos as evidence. Visual documentation helps officials understand and prioritize issues faster.
              </p>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.featureCard}>
              <div style={styles.featureIcon} className="feature-icon"><HiMapPin /></div>
              <h3 style={styles.featureTitle}>Location Tracking</h3>
              <p style={styles.featureText}>
                Precise geolocation ensures complaints reach the right local authority. View all complaints on an interactive map.
              </p>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.featureCard}>
              <div style={styles.featureIcon} className="feature-icon"><HiBell /></div>
              <h3 style={styles.featureTitle}>Smart Notifications</h3>
              <p style={styles.featureText}>
                Receive instant SMS and email alerts for status changes, official responses, and resolution updates.
              </p>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.featureCard}>
              <div style={styles.featureIcon} className="feature-icon"><HiChartBar /></div>
              <h3 style={styles.featureTitle}>Analytics Dashboard</h3>
              <p style={styles.featureText}>
                Track complaint trends, resolution times, and department performance. Data-driven insights for better governance.
              </p>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.featureCard}>
              <div style={styles.featureIcon} className="feature-icon"><HiShieldCheck /></div>
              <h3 style={styles.featureTitle}>Secure & Private</h3>
              <p style={styles.featureText}>
                End-to-end encryption protects your data. Role-based access ensures only authorized officials view complaints.
              </p>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.featureCard}>
              <div style={styles.featureIcon} className="feature-icon"><HiChatBubbleLeftRight /></div>
              <h3 style={styles.featureTitle}>Two-Way Communication</h3>
              <p style={styles.featureText}>
                Chat directly with assigned officials. Ask questions, provide updates, and stay informed throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={styles.useCases} className="scroll-animate">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Real-World Impact</h2>
          <p style={styles.sectionSubtitle}>
            See how CivicResolve is making a difference in communities
          </p>

          <div style={styles.useCaseGrid}>
            <div className="card-gradient-hover card-hover" style={styles.useCaseCard}>
              <div style={styles.useCaseEmoji} className="use-case-emoji"><FaHardHat /></div>
              <h3 style={styles.useCaseTitle}>Road Damage</h3>
              <p style={styles.useCaseText}>
                "A pothole on Main Street was causing accidents. I filed a complaint with photos. Within 3 days, it was assigned to the PWD. The road was repaired in 7 days with photo proof."
              </p>
              <div style={styles.useCaseMeta}>
                <span><HiCheckCircle style={{ marginRight: '4px', display: 'inline' }} />Resolved in 7 days</span>
                <span><MdLocationOn style={{ marginRight: '4px', display: 'inline' }} />Mumbai, Maharashtra</span>
              </div>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.useCaseCard}>
              <div style={styles.useCaseEmoji} className="use-case-emoji"><FaTint /></div>
              <h3 style={styles.useCaseTitle}>Water Supply Issue</h3>
              <p style={styles.useCaseText}>
                "Our locality had no water for 5 days. I raised a complaint, and it was escalated to the water board. They fixed the pipeline leak and restored supply within 48 hours."
              </p>
              <div style={styles.useCaseMeta}>
                <span><HiCheckCircle style={{ marginRight: '4px', display: 'inline' }} />Resolved in 2 days</span>
                <span><MdLocationOn style={{ marginRight: '4px', display: 'inline' }} />Bangalore, Karnataka</span>
              </div>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.useCaseCard}>
              <div style={styles.useCaseEmoji} className="use-case-emoji"><FaLightbulb /></div>
              <h3 style={styles.useCaseTitle}>Street Light Outage</h3>
              <p style={styles.useCaseText}>
                "Dark streets were unsafe at night. Filed a complaint about non-functional street lights. The electrical department responded same day and replaced all bulbs within 24 hours."
              </p>
              <div style={styles.useCaseMeta}>
                <span><HiCheckCircle style={{ marginRight: '4px', display: 'inline' }} />Resolved in 1 day</span>
                <span><MdLocationOn style={{ marginRight: '4px', display: 'inline' }} />Delhi NCR</span>
              </div>
            </div>

            <div className="card-gradient-hover card-hover" style={styles.useCaseCard}>
              <div style={styles.useCaseEmoji} className="use-case-emoji"><FaTrash /></div>
              <h3 style={styles.useCaseTitle}>Garbage Collection</h3>
              <p style={styles.useCaseText}>
                "Overflowing bins were creating health hazards. Submitted complaint with location. Sanitation team cleared the area and set up a regular collection schedule."
              </p>
              <div style={styles.useCaseMeta}>
                <span><HiCheckCircle style={{ marginRight: '4px', display: 'inline' }} />Resolved in 3 days</span>
                <span><MdLocationOn style={{ marginRight: '4px', display: 'inline' }} />Pune, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonials} className="scroll-animate">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>What Citizens Say</h2>
          <p style={styles.sectionSubtitle}>
            Real feedback from people using CivicResolve
          </p>

          <div className="marquee-container">
            <div className="marquee-content">
              {/* Duplicate the feedbacks to create seamless infinite scroll loop */}
              {[...feedbacks, ...feedbacks].map((feedback, index) => (
                <div key={index} className="card-gradient-hover" style={styles.testimonialCard}>
                  <div style={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: i < feedback.rating ? '#FFD700' : '#E5E7EB' }}>★</span>
                    ))}
                  </div>
                  <p style={styles.testimonialText}>
                    "{feedback.comment}"
                  </p>
                  <div style={styles.testimonialAuthor}>
                    <div style={styles.authorAvatar} className="author-avatar">{feedback.role ? feedback.role.charAt(0) : 'U'}</div>
                    <div>
                      <div style={styles.authorName}>{feedback.role || 'Citizen'}</div>
                      <div style={styles.authorRole}>{feedback.location || 'India'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={styles.faq} className="scroll-animate">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p style={styles.sectionSubtitle}>
            Everything you need to know about CivicResolve
          </p>

          <div style={styles.faqContainer}>
            {faqData.map((faq, index) => (
              <div key={index} style={styles.faqItem}>
                <button
                  onClick={() => toggleFaq(index)}
                  style={styles.faqQuestion}
                >
                  <span>{faq.question}</span>
                  <HiChevronDown style={{
                    ...styles.faqIcon,
                    transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} />
                </button>
                {openFaq === index && (
                  <div style={styles.faqAnswer}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
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
            <div style={styles.badge}>
              <span style={styles.badgeIcon}><HiShieldCheck /></span>
              <span style={styles.badgeText}>100% Transparent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={styles.finalCta} className="scroll-animate">
        <div style={styles.container}>
          <div style={styles.ctaBox}>
            <h2 style={styles.ctaTitle}>Ready to Make a Difference?</h2>
            <p style={styles.ctaText}>
              Join thousands of citizens who are using CivicResolve to improve their communities. Your voice matters, and we ensure it's heard.
            </p>
            <div style={styles.ctaButtons}>
              <Link to="/citizen/register" style={{ textDecoration: 'none' }}>
                <button className="btn-gradient-cta btn-hover-lift" style={styles.ctaPrimaryBtn}>
                  <HiRocketLaunch style={{ display: 'inline', marginRight: '8px' }} />
                  Create Free Account
                </button>
              </Link>
              <Link to="/citizen/login" style={{ textDecoration: 'none' }}>
                <button className="btn-gradient-secondary btn-hover-lift" style={styles.ctaSecondaryBtn}>
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const faqData = [
  {
    question: "How do I file a complaint?",
    answer: "Simply register as a citizen, log in, and click 'File Complaint'. Fill in the details, add photos/videos if needed, select the category, and submit. You'll receive a unique ticket ID to track your complaint."
  },
  {
    question: "How long does it take to resolve a complaint?",
    answer: "Resolution time varies by category and severity. Most complaints are resolved within 7-15 days. You can track the expected timeline on your complaint dashboard. If deadlines are missed, complaints automatically escalate."
  },
  {
    question: "What happens if my complaint is not resolved on time?",
    answer: "CivicResolve has an automatic escalation system. If a complaint isn't resolved within the specified timeframe, it's automatically escalated to higher authorities. You'll be notified at each escalation level."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, absolutely. We use end-to-end encryption and follow government data protection standards. Your personal information is only visible to authorized officials handling your complaint."
  },
  {
    question: "Can I track multiple complaints?",
    answer: "Yes, you can file and track unlimited complaints from your dashboard. Each complaint has a unique ID and separate tracking timeline."
  },
  {
    question: "Do I need to pay to use CivicResolve?",
    answer: "No, CivicResolve is completely free for all citizens. It's a government initiative to improve civic services and accountability."
  },
  {
    question: "What types of complaints can I file?",
    answer: "You can file complaints related to roads, water supply, electricity, sanitation, garbage collection, street lights, public infrastructure, and other civic issues. Categories are continuously updated based on citizen needs."
  },
  {
    question: "Will I be notified about complaint updates?",
    answer: "Yes, you'll receive real-time notifications via SMS and email whenever there's an update: when your complaint is acknowledged, assigned, in-progress, resolved, or escalated."
  },
  {
    question: "Can I communicate with the assigned official?",
    answer: "Yes, CivicResolve provides a two-way communication channel. You can chat with the assigned official, ask questions, and provide additional information if needed."
  },
  {
    question: "What if I'm not satisfied with the resolution?",
    answer: "You can provide feedback and rating after resolution. If you're not satisfied, you can reopen the complaint or escalate it to higher authorities through the platform."
  }
];

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  hero: {
    background: 'linear-gradient(135deg, #003366 0%, #1e40af 50%, #3b82f6 100%)',
    padding: '5rem 1rem 6rem',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  emblem: {
    marginBottom: '1.5rem',
  },
  emblemCircle: {
    width: '110px',
    height: '110px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3.5rem',
    backdropFilter: 'blur(10px)',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '4rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    fontSize: '1.35rem',
    fontWeight: '500',
    marginBottom: '1rem',
    opacity: 0.95,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  tagline: {
    fontSize: '1.2rem',
    marginBottom: '2.5rem',
    opacity: 0.95,
    maxWidth: '750px',
    margin: '0 auto 2.5rem',
    lineHeight: '1.7',
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
  stats: {
    padding: '4rem 1rem',
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
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '1.05rem',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  problemSolution: {
    padding: '5rem 1rem',
    background: 'var(--bg)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.75rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '1rem',
    color: 'var(--text)',
  },
  sectionSubtitle: {
    fontSize: '1.125rem',
    textAlign: 'center',
    marginBottom: '3rem',
    color: 'var(--muted)',
    maxWidth: '700px',
    margin: '0 auto 3rem',
    lineHeight: '1.6',
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  comparisonCard: {
    background: 'var(--card)',
    padding: '2.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
  },
  comparisonBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  comparisonBadgeSuccess: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#dcfce7',
    color: '#16a34a',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  comparisonTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: 'var(--text)',
  },
  problemList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '1rem',
    lineHeight: '2',
    color: 'var(--muted)',
  },
  solutionList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '1rem',
    lineHeight: '2',
    color: 'var(--muted)',
  },
  howItWorks: {
    padding: '5rem 1rem',
    background: 'linear-gradient(to bottom, var(--bg) 0%, var(--card) 100%)',
  },
  stepsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '3rem',
  },
  stepCard: {
    background: 'var(--card)',
    padding: '2rem',
    borderRadius: '16px',
    border: '2px solid var(--border)',
    textAlign: 'center',
    maxWidth: '200px',
    position: 'relative',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.3s ease',
  },
  stepNumber: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '35px',
    height: '35px',
    background: 'linear-gradient(135deg, #FF9933 0%, #f59e0b 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.125rem',
    boxShadow: '0 4px 10px rgba(255, 153, 51, 0.4)',
  },
  stepIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: 'var(--primary)',
  },
  stepTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: 'var(--text)',
  },
  stepText: {
    fontSize: '0.9rem',
    color: 'var(--muted)',
    lineHeight: '1.6',
  },
  stepArrow: {
    fontSize: '2rem',
    color: 'var(--primary)',
    fontWeight: '700',
  },
  features: {
    padding: '5rem 1rem',
    background: 'var(--bg)',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    background: 'var(--card)',
    padding: '2.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--shadow-sm)',
  },
  featureIcon: {
    fontSize: '3.5rem',
    marginBottom: '1.25rem',
    color: 'var(--primary)',
  },
  featureTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: 'var(--text)',
  },
  featureText: {
    fontSize: '1rem',
    color: 'var(--muted)',
    lineHeight: '1.7',
  },
  useCases: {
    padding: '5rem 1rem',
    background: 'linear-gradient(to bottom, var(--card) 0%, var(--bg) 100%)',
  },
  useCaseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  useCaseCard: {
    background: 'var(--card)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
  },
  useCaseEmoji: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  useCaseTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: 'var(--text)',
  },
  useCaseText: {
    fontSize: '0.95rem',
    color: 'var(--muted)',
    lineHeight: '1.7',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  },
  useCaseMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--primary)',
    fontWeight: '500',
  },
  testimonials: {
    padding: '5rem 1rem',
    background: 'var(--bg)',
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  testimonialCard: {
    background: 'var(--card)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
    minWidth: '320px',  // Fixed width
    width: '320px',     // Fixed width
    height: '320px',    // Fixed height (Square-ish)
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0,      // Prevent shrinking in marquee
  },
  stars: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
  },
  testimonialText: {
    fontSize: '1.05rem',
    color: 'var(--text)',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
    flex: 1,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 7, // Limit text lines
    WebkitBoxOrient: 'vertical',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  authorAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF9933 0%, #f59e0b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '1.125rem',
  },
  authorName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text)',
  },
  authorRole: {
    fontSize: '0.875rem',
    color: 'var(--muted)',
  },
  faq: {
    padding: '5rem 1rem',
    background: 'linear-gradient(to bottom, var(--bg) 0%, var(--card) 100%)',
  },
  faqContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  faqItem: {
    marginBottom: '1rem',
    background: 'var(--card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  faqQuestion: {
    width: '100%',
    padding: '1.5rem',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s ease',
  },
  faqIcon: {
    fontSize: '1.5rem',
    transition: 'transform 0.3s ease',
    color: 'var(--primary)',
  },
  faqAnswer: {
    padding: '0 1.5rem 1.5rem',
    fontSize: '1rem',
    color: 'var(--muted)',
    lineHeight: '1.7',
  },
  trust: {
    padding: '4rem 1rem',
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
  finalCta: {
    padding: '5rem 1rem',
    background: 'linear-gradient(135deg, #003366 0%, #1e40af 50%, #3b82f6 100%)',
  },
  ctaBox: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    color: 'white',
  },
  ctaTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '1rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  ctaText: {
    fontSize: '1.25rem',
    marginBottom: '2.5rem',
    opacity: 0.95,
    lineHeight: '1.7',
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaPrimaryBtn: {
    padding: '1.125rem 3rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #FF9933 0%, #f59e0b 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(255, 153, 51, 0.4)',
    transition: 'all 0.3s ease',
  },
  ctaSecondaryBtn: {
    padding: '1.125rem 3rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
};
