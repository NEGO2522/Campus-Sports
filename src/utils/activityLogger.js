import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

// Types of activities
const ACTIVITY_TYPES = {
  EVENT_CREATED: 'event_created',
  EVENT_JOINED: 'event_joined',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  COMMENT_ADDED: 'comment_added'
};

/**
 * Log an activity to Firestore
 * @param {string} type - Type of activity (use ACTIVITY_TYPES)
 * @param {string} eventId - ID of the related event
 * @param {string} eventName - Name of the event
 * @param {string} eventType - Type of sport/event
 * @param {string} eventLocation - Location of the event
 * @param {string} message - Custom message for the activity
 * @param {boolean} isPublic - Whether the activity is public
 * @returns {Promise}
 */
const logActivity = async ({
  type,
  eventId,
  eventName,
  eventType,
  eventLocation,
  message,
  isPublic = true
}) => {
  const user = auth.currentUser;
  if (!user) {
    console.error('No user logged in to log activity');
    return null;
  }

  try {
    const activityData = {
      type,
      userId: user.uid,
      userName: user.displayName || 'Anonymous User',
      userPhoto: user.photoURL || null,
      eventId,
      eventName,
      eventType,
      eventLocation,
      message: message || generateDefaultMessage(type, eventName, user.displayName),
      isPublic,
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'activities'), activityData);
    return docRef.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

/**
 * Generate a default message based on activity type
 */
const generateDefaultMessage = (type, eventName, userName) => {
  switch (type) {
    case ACTIVITY_TYPES.EVENT_CREATED:
      return `${userName} created a new event: ${eventName}`;
    case ACTIVITY_TYPES.EVENT_JOINED:
      return `${userName} joined the event: ${eventName}`;
    case ACTIVITY_TYPES.EVENT_UPDATED:
      return `${userName} updated the event: ${eventName}`;
    case ACTIVITY_TYPES.EVENT_CANCELLED:
      return `${userName} cancelled the event: ${eventName}`;
    case ACTIVITY_TYPES.COMMENT_ADDED:
      return `${userName} commented on the event: ${eventName}`;
    default:
      return `${userName} performed an action on the event: ${eventName}`;
  }
};

export { logActivity, ACTIVITY_TYPES };
