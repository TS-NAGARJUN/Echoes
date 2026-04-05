/**
 * @file hooks/useSocket.js
 * @description Custom hook for managing Socket.io connection and real-time events
 * Handles joining rooms, listening for user presence updates, and message events
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Custom hook to manage Socket.io connection
 * Automatically handles user joining and presence updates
 *
 * @returns {Object} Socket connection object with methods and state
 * @returns {SocketIOClient} socketConnection.socket - Socket.io instance
 * @returns {Array} socketConnection.onlineUsers - List of currently online users
 * @returns {boolean} socketConnection.isConnected - Connection status
 * @returns {Function} socketConnection.joinRoom - Manually join a room
 * @returns {Function} socketConnection.leaveRoom - Manually leave a room
 */
export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(null); // null = checking, true = connected, false = disconnected

  /**
   * Join user to their personal room on socket connection
   */
  const joinRoom = useCallback((userId, userData) => {
    if (socketRef.current) {
      socketRef.current.emit('join', {
        userId,
        userData: userData || {},
      });
      console.log(`[Socket] Joined room for user: ${userId}`);
    }
  }, []);

  /**
   * Manually leave a room
   */
  const leaveRoom = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave', { roomId });
      console.log(`[Socket] Left room: ${roomId}`);
    }
  }, []);

  /**
   * Emit a message to a specific user
   */
  const sendMessage = useCallback((messageData) => {
    if (socketRef.current) {
      socketRef.current.emit('newMessage', messageData);
    }
  }, []);

  /**
   * Emit typing indicator
   */
  const emitTyping = useCallback((receiverId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('userTyping', {
        userId: user._id,
        receiverId,
      });
    }
  }, [user]);

  /**
   * Emit stopped typing indicator
   */
  const emitStoppedTyping = useCallback((receiverId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('userStoppedTyping', {
        userId: user._id,
        receiverId,
      });
    }
  }, [user]);

  /**
   * Initialize socket connection
   */
  useEffect(() => {
    if (!user?._id) {
      console.log('[Socket] Waiting for user to authenticate...');
      return;
    }

    console.log('[Socket] Initializing socket connection with user:', user._id);
    console.log('[Socket] Connecting to:', SOCKET_SERVER_URL);

    // Create socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      query: {
        userId: user._id,
      },
    });

    /**
     * Handle connection established
     */
    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected to server');
      setIsConnected(true);

      // Join user's personal room with full user data
      socketRef.current.emit('join', {
        userId: user._id,
        userData: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
        },
      });
      console.log('[Socket] Emitted join event for user:', user._id);
    });

    /**
     * Handle new user joined
     */
    socketRef.current.on('userJoined', (data) => {
      console.log('[Socket] User joined event:', data);
      const users = Array.isArray(data?.onlineUsers) ? data.onlineUsers : [];
      setOnlineUsers(users);
    });

    /**
     * Handle user left
     */
    socketRef.current.on('userLeft', (data) => {
      console.log('[Socket] User left event:', data);
      const users = Array.isArray(data?.onlineUsers) ? data.onlineUsers : [];
      setOnlineUsers(users);
    });

    /**
     * Handle incoming message
     */
    socketRef.current.on('message', (message) => {
      console.log('[Socket] New message received:', message);
      // This will be handled by message-specific listeners in components
    });

    /**
     * Handle connection error
     */
    socketRef.current.on('error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    /**
     * Handle connection error event
     */
    socketRef.current.on('connect_error', (error) => {
      console.error('[Socket] Connect error:', error);
      setIsConnected(false);
    });

    /**
     * Handle disconnection
     */
    socketRef.current.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
      console.warn('[Socket] Attempting to reconnect...');
    });

    /**
     * Cleanup on component unmount
     */
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id, user?.name, user?.email, user?.profilePic, joinRoom]);

  return {
    socket: socketRef.current,
    onlineUsers,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    emitTyping,
    emitStoppedTyping,
  };
};

/**
 * Socket event listener hook for specific events
 * Use this to listen to specific socket events in components
 *
 * @param {string} eventName - Name of the event to listen to
 * @param {Function} callback - Callback function when event is received
 * @param {SocketIOClient} socket - Socket instance from useSocket
 */
export const useSocketEvent = (eventName, callback, socket) => {
  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};
