import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiDocumentText,
  HiClipboardDocumentList,
  HiMapPin,
  HiCheckCircle,
  HiArrowPath,
  HiExclamationTriangle,
  HiCamera
} from 'react-icons/hi2';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultMapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function FileComplaint() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaFile, setMediaFile] = useState(null); // State for the captured File object
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    // Structured location data
    latitude: null,
    longitude: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'location' && { latitude: null, longitude: null }) // Clear GPS coords if user types manually
    }));
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      // Ensure video plays automatically
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [stream]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate evidence is provided
    if (!mediaFile) {
      setError('Evidence (photo or video) is required. Please capture evidence before submitting.');
      setLoading(false);
      return;
    }

    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('category', formData.category);

    // Append location data based on what's available
    if (formData.latitude && formData.longitude) {
      submissionData.append('latitude', formData.latitude);
      submissionData.append('longitude', formData.longitude);
    } else {
      submissionData.append('manualAddress', formData.location);
    }

    // Append the captured file
    submissionData.append('evidence', mediaFile);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          // Content-Type is set automatically by the browser for FormData
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submissionData
      });
      const data = await res.json();
      if (res.ok) {
        alert("Complaint Submitted Successfully!");
        navigate("/citizen/home");
      } else {
        throw new Error(data.message || data.name || "An unknown error occurred during submission."); // More robust error message
      }
    } catch (error) {
      setError(error.message || "Error submitting complaint");
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse Geocoding via Nominatim (OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          const address = data.display_name || `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;

          let city = data.address.city || data.address.town || data.address.village || data.address.county || "";
          let area = data.address.suburb || data.address.neighbourhood || data.address.road || "";

          // Construct a shorter, friendlier location string
          let shortLocation = "";
          if (area && city) shortLocation = `${area}, ${city}`;
          else if (city) shortLocation = city;
          else shortLocation = address;

          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            location: shortLocation
          }));
        } catch (err) {
          console.error("Geocoding error:", err);
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`
          }));
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enter it manually.");
        setLoading(false);
      }
    );
  };

  const handleStartCamera = async () => {
    setError("");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Prefer back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (err.name === 'NotAllowedError') {
          setError("Camera access denied. Please allow camera permissions in your browser settings.");
        } else if (err.name === 'NotFoundError') {
          setError("No camera found on this device.");
        } else {
          setError("Could not access camera. Please check permissions and try again.");
        }
      }
    } else {
      setError("Camera not supported on this device/browser.");
    }
  };

  const handleCapturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    // Convert data URL to a File object to be sent with FormData
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => setMediaFile(new File([blob], `evidence-${Date.now()}.jpg`, { type: 'image/jpeg' })));

    stopCamera();
  };

  const handleStartRecording = () => {
    if (stream) {
      setIsRecording(true);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.start();
      const localVideoChunks = [];
      mediaRecorderRef.current.ondataavailable = event => {
        if (typeof event.data === 'undefined') return;
        if (event.data.size === 0) return;
        localVideoChunks.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(localVideoChunks, { type: 'video/webm' });
        // Create a File object to be sent with FormData
        setMediaFile(new File([videoBlob], `evidence-${Date.now()}.webm`, { type: 'video/webm' }));
        stopCamera();
      };
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleRetake = () => {
    setMediaFile(null);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <style>{`
          .file-complaint-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 32px;
          }
          @media (max-width: 1024px) {
            .file-complaint-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        {/* Header Section */}
        <div style={styles.header}>
          <h2 style={styles.title}><HiDocumentText style={{ display: 'inline', marginRight: '8px' }} />File a New Complaint</h2>
          <p style={styles.subtitle}>Help us serve you better by providing detailed information about the issue.</p>
        </div>

        <div className="file-complaint-grid">
          {/* Main Form */}
          <div style={styles.formSection}>
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Title Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}><HiClipboardDocumentList /></span>
                  <h3 style={styles.cardTitle}>Complaint Title</h3>
                </div>
                <div style={styles.group}>
                  <label style={styles.label}>Title *</label>
                  <input
                    className="input-gradient-focus"
                    style={styles.input}
                    placeholder="Brief, descriptive title (e.g., 'Broken streetlight on Main Road')"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Category Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>🏷️</span>
                  <h3 style={styles.cardTitle}>Category</h3>
                </div>
                <div style={styles.group}>
                  <label style={styles.label}>Select Category *</label>
                  <select
                    className="input-gradient-focus"
                    style={styles.input}
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a category...</option>
                    <option value="Roads & Infrastructure">🛣️ Roads & Infrastructure</option>
                    <option value="Water Supply">💧 Water Supply</option>
                    <option value="Sanitation & Garbage">🗑️ Sanitation & Garbage</option>
                    <option value="Electricity">⚡ Electricity</option>
                    <option value="Public Safety">🚨 Public Safety</option>
                    <option value="Parks & Recreation">🌳 Parks & Recreation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}><HiDocumentText /></span>
                  <h3 style={styles.cardTitle}>Description</h3>
                </div>
                <div style={styles.group}>
                  <label style={styles.label}>Detailed Description *</label>
                  <textarea
                    className="input-gradient-focus"
                    style={{ ...styles.input, ...styles.textarea }}
                    placeholder="Provide a detailed description of the issue. Include when it started, how it affects you, and any other relevant information..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    minLength={20}
                    required
                  />
                  <div style={{
                    ...styles.charCount,
                    color: formData.description.length < 20 ? 'var(--error)' : 'var(--muted)'
                  }}>
                    {formData.description.length} / 20 characters minimum
                    {formData.description.length > 0 && formData.description.length < 20 && (
                      <span style={{ marginLeft: '8px', color: 'var(--error)' }}>
                        ({20 - formData.description.length} more required)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>📍</span>
                  <h3 style={styles.cardTitle}>Location</h3>
                </div>
                <div style={styles.group}>
                  <label style={styles.label}>Address / Location *</label>
                  <input
                    style={styles.input}
                    placeholder="Enter the exact location or address"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="btn-gradient-primary"
                    style={styles.locationBtn}
                    disabled={loading}
                  >
                    <span style={styles.btnIcon}><HiMapPin /></span>
                    {loading ? "Detecting..." : "Use My Current Location"}
                  </button>
                  {formData.latitude && formData.longitude && (
                    <div style={{ marginTop: '1rem', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      {loadError ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--error)' }}>
                          Error loading Google Maps
                        </div>
                      ) : !isLoaded ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                          Loading map...
                        </div>
                      ) : (
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={{ lat: formData.latitude, lng: formData.longitude }}
                          zoom={15}
                          options={defaultMapOptions}
                        >
                          <Marker
                            position={{ lat: formData.latitude, lng: formData.longitude }}
                            onClick={() => setShowInfoWindow(true)}
                          />
                          {showInfoWindow && (
                            <InfoWindow
                              position={{ lat: formData.latitude, lng: formData.longitude }}
                              onCloseClick={() => setShowInfoWindow(false)}
                            >
                              <div style={{ color: '#000', padding: '4px' }}>
                                <strong>{formData.location}</strong>
                              </div>
                            </InfoWindow>
                          )}
                        </GoogleMap>
                      )}
                    </div>
                  )}
                  {formData.latitude && formData.longitude && (
                    <div style={styles.gpsIndicator}>
                      <div><strong>Detected:</strong> {formData.location}</div>
                      <div style={{ fontSize: '0.85em', opacity: 0.8 }}>Lat: {formData.latitude.toFixed(6)}, Long: {formData.longitude.toFixed(6)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>📸</span>
                  <h3 style={styles.cardTitle}>Evidence *</h3>
                </div>
                <div style={styles.group}>
                  <label style={styles.label}>Photo or Video Evidence</label>
                  <p style={styles.helperText}>Visual evidence helps us understand and resolve the issue faster.</p>

                  {stream && (
                    <div style={styles.cameraView}>
                      <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
                      {!isRecording ? (
                        <div style={styles.cameraActions}>
                          <button type="button" onClick={handleCapturePhoto} style={styles.captureBtn}>
                            <HiCamera style={{ display: 'inline', marginRight: '4px' }} />Capture Photo
                          </button>
                          <button type="button" onClick={handleStartRecording} style={styles.recordBtn}>
                            🎥 Start Recording
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={handleStopRecording} style={{ ...styles.recordBtn, ...styles.stopRecordBtn }}>
                          ⏹️ Stop Recording
                        </button>
                      )}
                      <button type="button" onClick={stopCamera} style={styles.cancelBtn}>✕</button>
                    </div>
                  )}

                  {mediaFile && (
                    <div style={styles.preview}>
                      {mediaFile.type.startsWith('image/') ?
                        <img src={URL.createObjectURL(mediaFile)} alt="Captured evidence" style={styles.previewMedia} /> :
                        <video src={URL.createObjectURL(mediaFile)} controls style={styles.previewMedia} />
                      }
                      <button type="button" onClick={handleRetake} style={styles.retakeBtn}><HiArrowPath style={{ display: 'inline', marginRight: '4px' }} />Retake</button>
                    </div>
                  )}

                  {!stream && !mediaFile && (
                    <button type="button" onClick={handleStartCamera} style={styles.mediaBtn}>
                      <span style={styles.mediaBtnIcon}>📸</span>
                      <span style={styles.mediaBtnText}>Take Live Picture or Video</span>
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div style={styles.errorBox}>
                  <span style={styles.errorIcon}><HiExclamationTriangle /></span>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-gradient-success" style={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <span style={styles.spinner}>⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span style={styles.btnIcon}><HiCheckCircle /></span>
                    Submit Complaint
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Information Sidebar */}
          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}><HiClipboardDocumentList style={{ display: 'inline', marginRight: '8px' }} />What Happens Next?</h3>
              <div style={styles.timeline}>
                <div style={styles.timelineItem}>
                  <div style={styles.timelineIcon}>1️⃣</div>
                  <div style={styles.timelineContent}>
                    <h4 style={styles.timelineTitle}>Submission</h4>
                    <p style={styles.timelineText}>Your complaint is registered in our system</p>
                  </div>
                </div>
                <div style={styles.timelineItem}>
                  <div style={styles.timelineIcon}>2️⃣</div>
                  <div style={styles.timelineContent}>
                    <h4 style={styles.timelineTitle}>Review</h4>
                    <p style={styles.timelineText}>Assigned to the relevant department within 24 hours</p>
                  </div>
                </div>
                <div style={styles.timelineItem}>
                  <div style={styles.timelineIcon}>3️⃣</div>
                  <div style={styles.timelineContent}>
                    <h4 style={styles.timelineTitle}>Action</h4>
                    <p style={styles.timelineText}>Officials work on resolving the issue</p>
                  </div>
                </div>
                <div style={styles.timelineItem}>
                  <div style={styles.timelineIcon}>4️⃣</div>
                  <div style={styles.timelineContent}>
                    <h4 style={styles.timelineTitle}>Resolution</h4>
                    <p style={styles.timelineText}>You'll be notified once resolved</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>⏱️ Estimated Resolution Time</h3>
              <div style={styles.estimateList}>
                <div style={styles.estimateItem}>
                  <span style={styles.estimateCategory}>🛣️ Roads & Infrastructure</span>
                  <span style={styles.estimateTime}>7-14 days</span>
                </div>
                <div style={styles.estimateItem}>
                  <span style={styles.estimateCategory}>💧 Water Supply</span>
                  <span style={styles.estimateTime}>2-5 days</span>
                </div>
                <div style={styles.estimateItem}>
                  <span style={styles.estimateCategory}>⚡ Electricity</span>
                  <span style={styles.estimateTime}>1-3 days</span>
                </div>
                <div style={styles.estimateItem}>
                  <span style={styles.estimateCategory}>🚨 Public Safety</span>
                  <span style={styles.estimateTime}>Immediate</span>
                </div>
              </div>
            </div>

            <div style={styles.helpBox}>
              <span style={styles.helpIcon}>💡</span>
              <div>
                <h4 style={styles.helpTitle}>Need Help?</h4>
                <p style={styles.helpText}>Call our helpline: <strong>1800-XXX-XXXX</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


const styles = {
  pageContainer: {
    background: "var(--bg)",
    minHeight: "100vh",
    paddingBottom: "40px"
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "24px"
  },
  header: {
    textAlign: "center",
    marginBottom: "32px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--text)",
    margin: "0 0 8px 0"
  },
  subtitle: {
    color: "var(--muted)",
    fontSize: "16px",
    margin: 0
  },
  progressBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "40px",
    gap: "8px"
  },
  progressStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  },
  progressStepActive: {
    color: "var(--primary)"
  },
  progressDot: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--border)",
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "16px"
  },
  progressLabel: {
    fontSize: "12px",
    fontWeight: "500"
  },
  progressLine: {
    width: "60px",
    height: "2px",
    background: "var(--border)",
    marginBottom: "28px"
  },
  contentGrid: {
    // Handled by CSS class .file-complaint-grid
  },
  formSection: {
    flex: 1
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "var(--shadow-sm)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid var(--border)"
  },
  cardIcon: {
    fontSize: "24px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text)"
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text)"
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: "14px",
    transition: "border-color 0.2s ease",
    outline: "none"
  },
  textarea: {
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit"
  },
  charCount: {
    fontSize: "12px",
    color: "var(--muted)",
    textAlign: "right"
  },
  helperText: {
    fontSize: "13px",
    color: "var(--muted)",
    margin: "0 0 12px 0"
  },
  locationBtn: {
    marginTop: "8px",
    padding: "12px 16px",
    background: "var(--bg)",
    border: "2px dashed var(--primary)",
    color: "var(--primary)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease"
  },
  btnIcon: {
    fontSize: "16px"
  },
  gpsIndicator: {
    marginTop: "8px",
    padding: "8px 12px",
    background: "var(--gov-green)",
    color: "white",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    display: "inline-block"
  },
  mediaBtn: {
    padding: "32px 24px",
    background: "var(--bg)",
    border: "2px dashed var(--border)",
    borderRadius: "12px",
    cursor: "pointer",
    color: "var(--muted)",
    fontSize: "15px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.2s ease"
  },
  mediaBtnIcon: {
    fontSize: "48px"
  },
  mediaBtnText: {
    fontWeight: "500"
  },
  cameraView: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#000"
  },
  video: {
    width: "100%",
    borderRadius: "12px",
    display: "block"
  },
  cameraActions: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "16px"
  },
  captureBtn: {
    padding: "12px 24px",
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    borderRadius: "24px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  },
  recordBtn: {
    padding: "12px 24px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "24px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  },
  stopRecordBtn: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)"
  },
  cancelBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "8px 12px",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  },
  preview: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden"
  },
  previewMedia: {
    width: "100%",
    borderRadius: "12px",
    display: "block"
  },
  retakeBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "8px 16px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
  },
  errorBox: {
    padding: "16px",
    background: "rgba(220, 38, 38, 0.1)",
    border: "1px solid var(--error)",
    borderRadius: "8px",
    color: "var(--error)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px"
  },
  errorIcon: {
    fontSize: "20px"
  },
  submitBtn: {
    padding: "16px 24px",
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    marginTop: "8px"
  },
  spinner: {
    fontSize: "18px",
    animation: "spin 1s linear infinite"
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  infoCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "var(--shadow-sm)"
  },
  infoTitle: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text)"
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  timelineItem: {
    display: "flex",
    gap: "12px"
  },
  timelineIcon: {
    fontSize: "24px",
    lineHeight: 1,
    flexShrink: 0
  },
  timelineContent: {
    flex: 1
  },
  timelineTitle: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text)"
  },
  timelineText: {
    margin: 0,
    fontSize: "13px",
    color: "var(--muted)",
    lineHeight: "1.5"
  },
  estimateList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  estimateItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "var(--bg)",
    borderRadius: "8px",
    fontSize: "13px"
  },
  estimateCategory: {
    color: "var(--text)",
    fontWeight: "500"
  },
  estimateTime: {
    color: "var(--primary)",
    fontWeight: "600"
  },
  helpBox: {
    background: "linear-gradient(135deg, var(--primary), var(--gov-blue-dark))",
    color: "white",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start"
  },
  helpIcon: {
    fontSize: "32px",
    lineHeight: 1
  },
  helpTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "600"
  },
  helpText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.5",
    opacity: 0.95
  }
};