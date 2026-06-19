export const isActionableUnreadNotification = (notification) => {
  if (!notification || notification.type === "notification") {
    return false;
  }

  return Number(notification.status) === 0;
};

export const getUnreadActionableNotificationCount = (notifications = []) =>
  Array.isArray(notifications)
    ? notifications.filter(isActionableUnreadNotification).length
    : 0;
