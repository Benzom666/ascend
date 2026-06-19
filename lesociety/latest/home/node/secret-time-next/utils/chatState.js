export const hasUnreadConversationActivity = (conversation, currentUserId) => {
  if (!conversation?.message || !currentUserId) {
    return false;
  }

  const status = Number(conversation?.status);
  const isActiveConversation = status === 1 || status === 2;
  const isIncomingMessage = conversation?.message?.sender_id !== currentUserId;
  const isUnread = !conversation?.message?.read_date_time;

  return isActiveConversation && isIncomingMessage && isUnread;
};

// A pending request is an incoming chat room (status=0) where the current
// user is the receiver. These show up as "Pending Requests" in the inbox
// and should light up the message-icon badge for the receiver.
export const isPendingIncomingRequest = (conversation, currentUserId) => {
  if (!conversation || !currentUserId) return false;

  const status = Number(conversation?.status);
  if (status !== 0) return false;

  // Filter out expired pending requests
  const expiresAt = conversation?.expires_at
    ? new Date(conversation.expires_at).getTime()
    : null;
  if (expiresAt && expiresAt <= Date.now()) return false;

  // Receiver is the user who DID NOT send the original request message.
  // If there's no message yet (rare), fall back to checking that current
  // user is in the room but is not the requester.
  const senderId = conversation?.message?.sender_id;
  if (senderId) {
    return senderId !== currentUserId;
  }

  // Fallback: requester field if present
  if (conversation?.requester_id) {
    return conversation.requester_id !== currentUserId;
  }

  return false;
};

export const getPendingIncomingRequestCount = (
  conversations = [],
  currentUserId
) =>
  Array.isArray(conversations)
    ? conversations.filter((conversation) =>
        isPendingIncomingRequest(conversation, currentUserId)
      ).length
    : 0;

export const getUnreadConversationActivityCount = (
  conversations = [],
  currentUserId
) =>
  Array.isArray(conversations)
    ? conversations.filter((conversation) =>
        hasUnreadConversationActivity(conversation, currentUserId)
      ).length
    : 0;
