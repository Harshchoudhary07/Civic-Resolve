const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

        // Join user to their personal room
        socket.join(`user:${socket.userId}`);

        // Join officials to their department room
        if (socket.userRole === 'official') {
            // Department will be set when needed
            socket.on('join-department', (department) => {
                socket.join(`department:${department}`);
                console.log(`Official joined department room: ${department}`);
            });
        }

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
        });
    });

    console.log('🔌 Socket.IO initialized');
    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

// Emit notification to specific user
const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit('notification', notification);
        console.log(`📢 Notification sent to user: ${userId}`);
    }
};

// Emit new complaint to department officials
const emitNewComplaint = (department, complaint) => {
    if (io) {
        io.to(`department:${department}`).emit('new-complaint', complaint);
        console.log(`📢 New complaint emitted to department: ${department}`);
    }
};

// Emit complaint update to all connected clients
const emitComplaintUpdate = (complaintId, update) => {
    if (io) {
        io.emit('complaint-update', { complaintId, update });
        console.log(`📢 Complaint update emitted: ${complaintId}`);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitNotification,
    emitNewComplaint,
    emitComplaintUpdate
};
