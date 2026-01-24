# Civic Resolve - Smart Complaint Redressal System

<div align="center">

![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-61dafb)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green)

**A modern, intelligent platform for civic complaint management and resolution**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Setup](#-installation--setup) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Installation & Setup](#-installation--setup)
- [User Roles & Workflows](#-user-roles--workflows)
- [Future Enhancements](#-future-enhancements)

---

## 🌟 Overview

**Civic Resolve** is a comprehensive complaint redressal system designed to bridge the gap between citizens and government authorities. It provides a transparent, efficient, and accountable platform for reporting, tracking, and resolving civic issues ranging from infrastructure problems to public safety concerns.

Built for hackathons and real-world deployment, this system leverages modern web technologies to deliver a seamless experience across all user roles - citizens, officials, and administrators.

---

## 🎯 Problem Statement

Citizens often face challenges when reporting civic issues:
- **Lack of Transparency**: No visibility into complaint status or resolution progress
- **Inefficient Communication**: Difficulty reaching the right authorities
- **No Accountability**: Issues get lost or ignored without proper tracking
- **Delayed Resolution**: No escalation mechanism for unresolved complaints
- **Duplicate Complaints**: Multiple reports for the same issue waste resources
- **Limited Evidence**: Text-only complaints lack visual proof

---

## 💡 Solution

Civic Resolve addresses these challenges through:

### For Citizens
- 📱 **Easy Complaint Filing**: Simple, intuitive interface with photo/video evidence
- 📍 **GPS Location Tracking**: Automatic location detection with Google Maps integration
- 🔔 **Real-time Notifications**: Instant updates via Socket.IO when complaint status changes
- 📊 **Complaint Tracking**: View detailed status history and timeline
- 🗳️ **Community Engagement**: Upvote important issues and participate in discussions
- 🔐 **Secure Authentication**: Email/password and Google OAuth login

### For Officials
- 📋 **Centralized Dashboard**: View and manage assigned complaints
- 🎯 **Department-based Assignment**: Complaints routed to relevant departments
- 📈 **Analytics & Insights**: Track resolution metrics and performance
- 💬 **Communication Tools**: Add remarks and updates to complaints
- ⚡ **Priority Management**: Focus on high-priority and escalated issues

### For Administrators
- 👥 **User Management**: Approve officials, manage roles and permissions
- 🏢 **Department Management**: Create and organize departments
- 📊 **System Analytics**: Comprehensive overview of all complaints and trends
- 🔍 **Complaint Oversight**: Monitor all complaints across departments
- 🏷️ **Category Management**: Define and manage complaint categories

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Multi-provider Authentication**: Email/password and Google OAuth
- **Role-based Access Control (RBAC)**: Citizen, Official, Admin, Pending Official
- **JWT Token-based Security**: Secure API endpoints with JSON Web Tokens
- **Official Approval Workflow**: Admin approval required for official accounts
- **Password Reset**: Secure password recovery via email

### 📝 Complaint Management
- **Rich Complaint Filing**: Title, description, category, location, and media evidence
- **GPS & Manual Location**: Automatic geolocation with Google Maps or manual address
- **Photo & Video Evidence**: Live camera capture with MediaRecorder API
- **Status Tracking**: Pending → In Progress → Resolved/Rejected/Escalated
- **Status History**: Complete audit trail of all status changes
- **Escalation System**: Automatic escalation for unresolved complaints
- **Duplicate Detection**: Group similar complaints to avoid redundancy

### 🔔 Real-time Features
- **Socket.IO Integration**: Live notifications for status updates
- **Instant Updates**: No page refresh needed for new data
- **Real-time Feed**: Community feed with live complaint updates
- **Notification System**: In-app notifications for all stakeholders

### 📊 Analytics & Reporting
- **Citizen Dashboard**: Personal complaint statistics and history
- **Official Dashboard**: Department-wise complaint metrics
- **Admin Analytics**: System-wide insights with Recharts visualizations
- **Performance Metrics**: Resolution time, pending complaints, success rates

### 🗺️ Location Services
- **Google Maps Integration**: Interactive map display for complaint locations
- **Geospatial Queries**: Find complaints by proximity (MongoDB 2dsphere index)
- **Reverse Geocoding**: Convert GPS coordinates to human-readable addresses
- **Location Validation**: Ensure accurate complaint positioning

### 🎨 User Experience
- **Modern UI/UX**: Clean, responsive design with CSS variables
- **Dark Mode Support**: Theme switching for user preference
- **Mobile Responsive**: Optimized for all screen sizes
- **Gradient Animations**: Smooth, premium visual effects
- **Loading States**: Clear feedback during async operations

### 📱 Community Features
- **Public Feed**: View all complaints in the community
- **Upvoting System**: Prioritize important issues
- **Comment System**: Discuss and collaborate on complaints
- **Feedback Mechanism**: Rate the resolution process

### 🔒 Security Features
- **Helmet.js**: HTTP security headers
- **CORS Protection**: Controlled cross-origin requests
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Express-validator for data sanitization
- **Cloudinary Integration**: Secure media storage

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Citizens   │  │  Officials   │  │    Admins    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   React SPA     │
                    │   (Vite Build)  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐       ┌──────────▼──────────┐
    │  REST API Layer   │       │  Socket.IO Server   │
    │  (Express.js)     │       │  (Real-time Events) │
    └─────────┬─────────┘       └──────────┬──────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │     Business Logic Layer    │
              │  ┌────────────────────────┐ │
              │  │ Controllers            │ │
              │  │ - Auth                 │ │
              │  │ - Complaints           │ │
              │  │ - Users                │ │
              │  │ - Admin                │ │
              │  └────────┬───────────────┘ │
              │           │                 │
              │  ┌────────▼───────────────┐ │
              │  │ Services               │ │
              │  │ - Email (Nodemailer)   │ │
              │  │ - Media (Cloudinary)   │ │
              │  │ - Auth (JWT/OAuth)     │ │
              │  └────────┬───────────────┘ │
              └───────────┼──────────────────┘
                          │
              ┌───────────▼──────────────┐
              │    Data Access Layer     │
              │  ┌────────────────────┐  │
              │  │ Mongoose Models    │  │
              │  │ - User             │  │
              │  │ - Complaint        │  │
              │  │ - Category         │  │
              │  │ - Department       │  │
              │  │ - Notification     │  │
              │  │ - Vote             │  │
              │  │ - Comment          │  │
              │  │ - Feedback         │  │
              │  │ - AuditLog         │  │
              │  └────────┬───────────┘  │
              └───────────┼──────────────┘
                          │
              ┌───────────▼──────────────┐
              │   MongoDB Database       │
              │  - Indexed Collections   │
              │  - Geospatial Queries    │
              │  - Aggregation Pipeline  │
              └──────────────────────────┘

              ┌──────────────────────────┐
              │  External Services       │
              │  - Cloudinary (Media)    │
              │  - Google OAuth          │
              │  - Google Maps API       │
              │  - Email Service         │
              └──────────────────────────┘
```

### Request Flow

```
1. User Action (Frontend)
   ↓
2. API Request (Axios)
   ↓
3. Middleware Chain
   - CORS
   - Helmet (Security)
   - Rate Limiting
   - JWT Authentication
   - Role Authorization
   - Input Validation
   ↓
4. Route Handler
   ↓
5. Controller Logic
   ↓
6. Service Layer (if needed)
   ↓
7. Database Query (Mongoose)
   ↓
8. Response + Socket.IO Emit (if real-time)
   ↓
9. Frontend State Update
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.2.0 |
| **Vite** | Build Tool & Dev Server | 5.3.1 |
| **React Router DOM** | Client-side Routing | 6.23.1 |
| **Axios** | HTTP Client | 1.7.2 |
| **Socket.IO Client** | Real-time Communication | 4.8.3 |
| **React Icons** | Icon Library | 5.5.0 |
| **Recharts** | Data Visualization | 3.7.0 |
| **Google Maps API** | Maps & Geolocation | 2.20.8 |
| **React OAuth Google** | Google Authentication | 0.12.1 |
| **CSS Variables** | Theming & Styling | - |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | ≥16.0.0 |
| **Express.js** | Web Framework | 4.19.2 |
| **MongoDB** | NoSQL Database | Latest |
| **Mongoose** | ODM for MongoDB | 9.1.4 |
| **Socket.IO** | WebSocket Server | 4.8.3 |
| **JWT** | Authentication Tokens | 9.0.3 |
| **bcryptjs** | Password Hashing | 2.4.3 |
| **Cloudinary** | Media Storage | 2.9.0 |
| **Nodemailer** | Email Service | 7.0.12 |
| **Multer** | File Upload | 2.0.2 |
| **Helmet** | Security Headers | 8.1.0 |
| **Morgan** | HTTP Logger | 1.10.1 |
| **CORS** | Cross-Origin Requests | 2.8.5 |
| **Express Validator** | Input Validation | 7.3.1 |
| **Express Rate Limit** | API Rate Limiting | 8.2.1 |
| **Google Auth Library** | OAuth 2.0 | 10.5.0 |
| **Firebase Admin** | Admin SDK | 13.6.0 |
| **dotenv** | Environment Variables | 17.2.3 |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **Concurrently** | Run multiple npm scripts |
| **Nodemon** | Auto-restart server |
| **ESLint** | Code linting |
| **Git** | Version control |
---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['citizen', 'official', 'admin', 'pending_official'],
  department: String,
  isActive: Boolean,
  authProvider: Enum ['local', 'google'],
  mobileNumber: String,
  profilePicture: String,
  aadhar: String (unique),
  timestamps: true
}
```

### Complaint Model
```javascript
{
  title: String (max 100 chars),
  description: String (max 2000 chars),
  category: String,
  user: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  currentStatus: Enum ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated'],
  location: {
    sourceType: Enum ['GPS', 'MANUAL'],
    address: String,
    coordinates: {
      type: 'Point',
      coordinates: [longitude, latitude] // GeoJSON
    }
  },
  statusHistory: [{
    status: String,
    updatedBy: ObjectId,
    remark: String,
    timestamp: Date
  }],
  attachments: [{
    url: String,
    mediaType: Enum ['image', 'video'],
    uploadedAt: Date
  }],
  remarks: [{
    official: ObjectId,
    text: String,
    createdAt: Date
  }],
  upvoteCount: Number,
  commentCount: Number,
  priorityScore: Number,
  isArchived: Boolean,
  timestamps: true
}

// Indexes
- { user: 1, currentStatus: 1 }
- { category: 1 }
- { priorityScore: -1, createdAt: -1 }
- { 'location.coordinates': '2dsphere' }
```

### Other Models
- **Category**: Complaint categories
- **Department**: Government departments
- **Notification**: User notifications
- **Vote**: Complaint upvotes
- **Comment**: Complaint comments
- **Feedback**: User feedback on resolutions
- **AuditLog**: System audit trail
- **OTP**: Password reset tokens

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Google Cloud Console project (for OAuth & Maps)

### Environment Variables

Create `.env` file in `Backend/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/civic-resolve
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-resolve

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

Create `.env` file in `Backend/Frontend/` directory:

```env
# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# API Base URL (for production)
VITE_API_URL=http://localhost:5000
```

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/Civic-Resolve.git
   cd Civic-Resolve
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd Frontend
   npm install
   cd ..
   ```

4. **Setup Environment Variables**
   - Create `.env` files as shown above
   - Replace placeholder values with your actual credentials

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # If using MongoDB Atlas, ensure your connection string is correct in .env
   ```

6. **Run the Application**

   **Option 1: Development Mode (Concurrent)**
   ```bash
   # From Backend directory
   npm run dev
   ```
   This runs both backend (port 5000) and frontend (port 5173) concurrently.

   **Option 2: Separate Terminals**
   ```bash
   # Terminal 1 - Backend
   cd Backend
   npm start
   
   # Terminal 2 - Frontend
   cd Backend/Frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen"
}

Response: 201 Created
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Google OAuth Login
```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "google_id_token"
}
```

### Complaint Endpoints

#### Create Complaint
```http
POST /api/complaints
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- title: "Broken streetlight"
- description: "Streetlight not working for 3 days"
- category: "Electricity"
- latitude: 28.6139
- longitude: 77.2090
- evidence: [File]

Response: 201 Created
{
  "complaint": { ... }
}
```

#### Get All Complaints (Citizen)
```http
GET /api/complaints
Authorization: Bearer {token}

Response: 200 OK
{
  "complaints": [ ... ]
}
```

#### Get Complaint Details
```http
GET /api/complaints/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "complaint": { ... }
}
```

#### Update Complaint Status (Official)
```http
PATCH /api/official/complaints/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "In Progress",
  "remark": "Work started on this issue"
}

Response: 200 OK
{
  "complaint": { ... }
}
```

### User Endpoints

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer {token}

Response: 200 OK
{
  "user": { ... }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "mobileNumber": "+1234567890"
}
```

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "users": [ ... ]
}
```

#### Approve Official
```http
PATCH /api/admin/users/:id/approve
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "message": "Official approved successfully"
}
```

#### Get Analytics
```http
GET /api/admin/analytics
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "totalComplaints": 150,
  "resolvedComplaints": 80,
  "pendingComplaints": 50,
  "inProgressComplaints": 20,
  "categoryStats": [ ... ],
  "departmentStats": [ ... ]
}
```

### Feed Endpoints

#### Get Public Feed
```http
GET /api/feed
Authorization: Bearer {token}
Query Params:
- page: 1
- limit: 10
- category: "Roads & Infrastructure"

Response: 200 OK
{
  "complaints": [ ... ],
  "totalPages": 5,
  "currentPage": 1
}
```

#### Upvote Complaint
```http
POST /api/feed/:id/upvote
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Upvoted successfully",
  "upvoteCount": 15
}
```

### Socket.IO Events

#### Client → Server
- `join_room`: Join user-specific notification room
- `leave_room`: Leave notification room

#### Server → Client
- `notification`: New notification received
  ```javascript
  {
    type: 'status_update',
    complaintId: 'complaint_id',
    message: 'Your complaint status changed to In Progress',
    timestamp: Date
  }
  ```
- `complaint_updated`: Complaint data changed
- `new_complaint`: New complaint filed (for officials)

---

## 👥 User Roles & Workflows

### 1. Citizen Workflow

```
1. Register/Login
   ↓
2. Navigate to "File Complaint"
   ↓
3. Fill complaint form:
   - Title & Description
   - Select Category
   - Detect/Enter Location
   - Capture Photo/Video Evidence
   ↓
4. Submit Complaint
   ↓
5. Receive Confirmation & Ticket ID
   ↓
6. Track Status in "My Complaints"
   ↓
7. Receive Real-time Notifications
   ↓
8. View Resolution & Provide Feedback
```

### 2. Official Workflow

```
1. Register as Official (Pending Approval)
   ↓
2. Admin Approves Account
   ↓
3. Login & Access Dashboard
   ↓
4. View Assigned Complaints
   ↓
5. Review Complaint Details
   ↓
6. Update Status:
   - Mark as "In Progress"
   - Add Remarks
   - Upload Resolution Evidence
   - Mark as "Resolved"
   ↓
7. Monitor Analytics & Performance
```

### 3. Admin Workflow

```
1. Login with Admin Credentials
   ↓
2. Access Admin Dashboard
   ↓
3. Manage Users:
   - Approve Pending Officials
   - Assign Departments
   - Deactivate Users
   ↓
4. Manage Departments & Categories
   ↓
5. Monitor All Complaints
   ↓
6. View System Analytics
   ↓
7. Handle Escalations
```

---

## 🔮 Future Enhancements

### Phase 1 (Short-term)
- **Multi-language Support**: Hindi, regional languages
- **SMS Notifications**: Twilio integration for SMS alerts
- **WhatsApp Bot**: Auto-responses for basic queries
- **Mobile App**: React Native or Flutter app
- **Advanced Search**: Full-text search with Elasticsearch
- **Complaint Templates**: Pre-filled forms for common issues

### Phase 2 (Medium-term)
- **AI-powered Categorization**: Auto-categorize complaints using NLP
- **Sentiment Analysis**: Analyze complaint urgency from text
- **Predictive Analytics**: Forecast complaint trends
- **Chatbot Support**: AI assistant for user queries
- **Video Calls**: Direct communication with officials
- **Blockchain Audit Trail**: Immutable complaint history

### Phase 3 (Long-term)
- **Government Integration**: Connect with existing e-governance systems
- **IoT Sensors**: Auto-detect issues (e.g., potholes, water leaks)
- **Crowdsourcing**: Community-driven solutions
- **Gamification**: Reward active citizens
- **Advanced Analytics**: Machine learning insights
- **Multi-city Deployment**: Scale to state/national level

---

## 🙏 Acknowledgments

- **Hackathon Organizers**: For providing this opportunity
- **Contributors**: For making this project better