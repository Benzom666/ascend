/**
 * Chat Service Layer
 * Business logic for chat operations
 */

const ChatRoom = require('../models/chat_room');
const Chat = require('../models/chat');
const User = require('../models/user');
const { createLogger } = require('../lib/logger');
const { NotFoundError, ValidationError, AuthorizationError } = require('../middleware/errorHandler');

const logger = createLogger('chat-service');

class ChatService {
    /**
     * Create or get chat room
     */
    async getOrCreateChatRoom(requesterId, receiverId, options = {}) {
        const { isSuperInterested = false } = options;

        // Check if room already exists
        let chatRoom = await ChatRoom.findOne({
            users: { $all: [requesterId, receiverId] }
        }).lean();

        if (chatRoom) {
            return chatRoom;
        }

        // Create new chat room
        const newRoom = new ChatRoom({
            users: [requesterId, receiverId],
            requester_id: requesterId,
            receiver_id: receiverId,
            isSuperInterested,
            status: 'pending',
            created_date: new Date()
        });

        const savedRoom = await newRoom.save();
        logger.info('Chat room created', { 
            roomId: savedRoom._id, 
            requesterId, 
            receiverId 
        });

        return savedRoom;
    }

    /**
     * Send message
     */
    async sendMessage(senderId, receiverId, messageText, chatRoomId) {
        if (!messageText || messageText.trim().length === 0) {
            throw new ValidationError('Message cannot be empty');
        }

        const message = new Chat({
            sender_id: senderId,
            receiver_id: receiverId,
            message: messageText.trim(),
            room_id: chatRoomId,
            created_date: new Date()
        });

        const savedMessage = await message.save();
        logger.debug('Message sent', { 
            messageId: savedMessage._id, 
            roomId: chatRoomId 
        });

        return savedMessage;
    }

    /**
     * Get chat messages
     */
    async getChatMessages(chatRoomId, userId, pagination = {}) {
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        // Verify user has access to this chat room
        const chatRoom = await ChatRoom.findById(chatRoomId).lean();
        if (!chatRoom) {
            throw new NotFoundError('Chat room');
        }

        if (!chatRoom.users.includes(userId.toString())) {
            throw new AuthorizationError('Access denied to this chat room');
        }

        const [messages, total] = await Promise.all([
            Chat.find({ room_id: chatRoomId })
                .sort({ created_date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Chat.countDocuments({ room_id: chatRoomId })
        ]);

        return {
            messages: messages.reverse(), // Oldest first
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user's chat rooms
     */
    async getUserChatRooms(userId) {
        const chatRooms = await ChatRoom.find({
            users: userId,
            is_blocked: { $ne: 1 }
        })
        .populate('users', 'full_name photos user_name')
        .sort({ last_message_date: -1 })
        .lean();

        // Get last message for each room
        const roomsWithLastMessage = await Promise.all(
            chatRooms.map(async (room) => {
                const lastMessage = await Chat.findOne({ room_id: room._id })
                    .sort({ created_date: -1 })
                    .lean();

                return {
                    ...room,
                    lastMessage
                };
            })
        );

        return roomsWithLastMessage;
    }

    /**
     * Mark messages as read
     */
    async markAsRead(chatRoomId, userId) {
        await Chat.updateMany(
            { 
                room_id: chatRoomId, 
                receiver_id: userId,
                is_read: false 
            },
            { $set: { is_read: true } }
        );

        logger.debug('Messages marked as read', { chatRoomId, userId });
        return true;
    }

    /**
     * Block chat room
     */
    async blockChatRoom(chatRoomId, userId) {
        const chatRoom = await ChatRoom.findById(chatRoomId);

        if (!chatRoom) {
            throw new NotFoundError('Chat room');
        }

        if (!chatRoom.users.includes(userId.toString())) {
            throw new AuthorizationError('Access denied');
        }

        chatRoom.is_blocked = 1;
        chatRoom.blocked_by = userId;
        await chatRoom.save();

        logger.info('Chat room blocked', { chatRoomId, userId });
        return chatRoom;
    }

    /**
     * Unblock chat room
     */
    async unblockChatRoom(chatRoomId, userId) {
        const chatRoom = await ChatRoom.findById(chatRoomId);

        if (!chatRoom) {
            throw new NotFoundError('Chat room');
        }

        if (!chatRoom.users.includes(userId.toString())) {
            throw new AuthorizationError('Access denied');
        }

        chatRoom.is_blocked = 0;
        chatRoom.blocked_by = null;
        await chatRoom.save();

        logger.info('Chat room unblocked', { chatRoomId, userId });
        return chatRoom;
    }

    /**
     * Delete chat room (and all messages)
     */
    async deleteChatRoom(chatRoomId, userId) {
        const chatRoom = await ChatRoom.findById(chatRoomId);

        if (!chatRoom) {
            throw new NotFoundError('Chat room');
        }

        if (!chatRoom.users.includes(userId.toString())) {
            throw new AuthorizationError('Access denied');
        }

        // Delete all messages
        await Chat.deleteMany({ room_id: chatRoomId });

        // Delete room
        await ChatRoom.findByIdAndDelete(chatRoomId);

        logger.info('Chat room deleted', { chatRoomId, userId });
        return true;
    }
}

module.exports = new ChatService();
