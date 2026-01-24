const Notification = require('../models/Notification');

/**
 * Creates a new notification for a user.
 * @param {string} userId - The ID of the user to notify.
 * @param {string} message - The notification message.
 * @param {string} [complaintId] - (Optional) The ID of the related complaint.
 * @returns {Promise<Object>} The created notification object
 */
const createNotification = async (userId, message, complaintId = null) => {
  if (!userId || !message) return null;

  const notification = await Notification.create({ user: userId, message, complaint: complaintId });
  return notification;
};

module.exports = { createNotification };