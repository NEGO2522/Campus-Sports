// activityLogger.js — Firebase code removed
// Activity logging will be done via backend API

export const ACTIVITY_TYPES = {
  EVENT_CREATED: 'event_created',
  EVENT_JOINED: 'event_joined',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  COMMENT_ADDED: 'comment_added'
};

// TODO: Implement after connecting to backend
// export const logActivity = async (data) => {
//   await api.post('/activities', data);
// };

export const logActivity = async (data) => {
  console.log('[Activity log - backend connection pending]:', data);
};
