import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleChatEvents = (io, socket) => {
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  console.log(`User ${socket.user.username} connected`);

  // Handle joining a conversation
  socket.on('join_conversation', async (conversationId) => {
    try {
      // Verify user is part of this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            has: socket.userId,
          },
        },
      });

      if (conversation) {
        socket.join(`conversation_${conversationId}`);
        socket.emit('joined_conversation', conversationId);
      } else {
        socket.emit('error', 'Unauthorized to join this conversation');
      }
    } catch (error) {
      console.error('Join conversation error:', error);
      socket.emit('error', 'Failed to join conversation');
    }
  });

  // Handle sending a message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, messageType = 'TEXT' } = data;

      // Verify conversation exists and user is participant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            has: socket.userId,
          },
        },
      });

      if (!conversation) {
        return socket.emit('error', 'Conversation not found or unauthorized');
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          content,
          senderId: socket.userId,
          conversationId,
          messageType,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
      });

      // Update conversation's last message
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageAt: new Date(),
        },
      });

      // Emit to all participants in the conversation
      io.to(`conversation_${conversationId}`).emit('new_message', message);

      // Send notification to other participants
      const otherParticipants = conversation.participants.filter(
        (id) => id !== socket.userId
      );
      otherParticipants.forEach((participantId) => {
        io.to(`user_${participantId}`).emit('message_notification', {
          conversationId,
          message,
          sender: socket.user,
        });
      });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle starting a new conversation
  socket.on('start_conversation', async (data) => {
    try {
      const { recipientId } = data;

      // Check if conversation already exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            hasEvery: [socket.userId, recipientId],
          },
        },
      });

      if (!conversation) {
        // Create new conversation
        conversation = await prisma.conversation.create({
          data: {
            participants: [socket.userId, recipientId],
          },
        });
      }

      // Join the conversation room
      socket.join(`conversation_${conversation.id}`);

      socket.emit('conversation_started', conversation);
    } catch (error) {
      console.error('Start conversation error:', error);
      socket.emit('error', 'Failed to start conversation');
    }
  });

  // Handle marking messages as read
  socket.on('mark_messages_read', async (data) => {
    try {
      const { conversationId } = data;

      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: socket.userId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Notify other participants that messages were read
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        readBy: socket.userId,
      });
    } catch (error) {
      console.error('Mark messages read error:', error);
      socket.emit('error', 'Failed to mark messages as read');
    }
  });

  // Handle user typing
  socket.on('typing_start', (data) => {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
    });
  });

  socket.on('typing_stop', (data) => {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
      userId: socket.userId,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.username} disconnected`);
  });
};
