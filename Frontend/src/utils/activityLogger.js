// activityLogger.js — Firebase wala code hata diya
// Activity logging backend API se hoga

export const ACTIVITY_TYPES = {
  EVENT_CREATED: 'event_created',
  EVENT_JOINED: 'event_joined',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  COMMENT_ADDED: 'comment_added'
};

// TODO: Backend se connect hone ke baad implement karna
// export const logActivity = async (data) => {
//   await api.post('/activities', data);
// };

export const logActivity = async (data) => {
  console.log('[Activity log - backend se connect pending]:', data);
};
