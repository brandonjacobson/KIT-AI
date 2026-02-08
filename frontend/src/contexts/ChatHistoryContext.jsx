import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateSmartTitle } from '../utils/dateUtils';

const ChatHistoryContext = createContext();

const STORAGE_KEY = 'kit-ai-chat-history';
const MAX_MESSAGE_COUNT = 100;
const STORAGE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Load chat history from localStorage
 */
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        conversations: {},
        currentConversationId: null,
        conversationOrder: []
      };
    }

    const parsed = JSON.parse(stored);
    return {
      conversations: parsed.conversations || {},
      currentConversationId: parsed.currentConversationId || null,
      conversationOrder: parsed.conversationOrder || []
    };
  } catch (error) {
    console.error('Failed to load chat history from localStorage:', error);
    return {
      conversations: {},
      currentConversationId: null,
      conversationOrder: []
    };
  }
}

/**
 * Save chat history to localStorage
 */
function saveToStorage(conversations, currentConversationId, conversationOrder) {
  try {
    const data = {
      conversations,
      currentConversationId,
      conversationOrder
    };

    const serialized = JSON.stringify(data);

    // Check storage size
    if (serialized.length > STORAGE_WARNING_THRESHOLD) {
      console.warn('Chat history approaching localStorage limit');
    }

    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save chat history to localStorage:', error);

    // If quota exceeded, try to delete oldest conversations
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, attempting cleanup...');
      // This will be handled by the component
      throw error;
    }
  }
}

export function ChatHistoryProvider({ children }) {
  const [conversations, setConversations] = useState({});
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversationOrder, setConversationOrder] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    setConversations(loaded.conversations);
    setCurrentConversationId(loaded.currentConversationId);
    setConversationOrder(loaded.conversationOrder);
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(conversations, currentConversationId, conversationOrder);
    }
  }, [conversations, currentConversationId, conversationOrder, isInitialized]);

  /**
   * Create a new empty conversation
   */
  const createNewConversation = () => {
    const id = generateUUID();
    const now = Date.now();

    const newConversation = {
      id,
      title: null, // Will be generated after first message
      createdAt: now,
      updatedAt: now,
      messages: []
    };

    setConversations(prev => ({
      ...prev,
      [id]: newConversation
    }));

    setCurrentConversationId(id);

    // Add to beginning of order
    setConversationOrder(prev => [id, ...prev]);

    return id;
  };

  /**
   * Load an existing conversation
   */
  const loadConversation = (id) => {
    if (conversations[id]) {
      setCurrentConversationId(id);
    } else {
      console.error(`Conversation ${id} not found`);
    }
  };

  /**
   * Delete a conversation
   */
  const deleteConversation = (id) => {
    // Remove from conversations
    setConversations(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    // Remove from order
    setConversationOrder(prev => prev.filter(convId => convId !== id));

    // If deleting current conversation, switch to another
    if (id === currentConversationId) {
      const remainingConversations = conversationOrder.filter(convId => convId !== id);

      if (remainingConversations.length > 0) {
        // Switch to most recent conversation
        setCurrentConversationId(remainingConversations[0]);
      } else {
        // No conversations left, create a new one
        createNewConversation();
      }
    }
  };

  /**
   * Add a message to the current conversation
   */
  const updateMessages = (newMessage) => {
    if (!currentConversationId) {
      // No current conversation, create one
      const id = createNewConversation();

      // The state update is async, so we'll add the message in the next call
      // For now, just return and let the user's next action add the message
      setTimeout(() => {
        updateMessages(newMessage);
      }, 0);
      return;
    }

    const now = Date.now();
    const messageWithTimestamp = {
      ...newMessage,
      timestamp: now
    };

    setConversations(prev => {
      const conversation = prev[currentConversationId];
      if (!conversation) return prev;

      const updatedMessages = [...conversation.messages, messageWithTimestamp];

      // Limit messages to MAX_MESSAGE_COUNT
      const limitedMessages = updatedMessages.slice(-MAX_MESSAGE_COUNT);

      // Generate title if this is the first user message
      let title = conversation.title;
      if (!title && newMessage.role === 'user') {
        title = generateSmartTitle(newMessage.content);
      }

      return {
        ...prev,
        [currentConversationId]: {
          ...conversation,
          title,
          updatedAt: now,
          messages: limitedMessages
        }
      };
    });

    // Update order to move this conversation to the top
    setConversationOrder(prev => {
      const filtered = prev.filter(id => id !== currentConversationId);
      return [currentConversationId, ...filtered];
    });
  };

  /**
   * Get messages for the current conversation
   */
  const currentMessages = currentConversationId && conversations[currentConversationId]
    ? conversations[currentConversationId].messages
    : [];

  /**
   * Get ordered list of conversations for display
   */
  const conversationsList = conversationOrder
    .map(id => conversations[id])
    .filter(Boolean) // Remove any undefined entries
    .filter(conv => conv.messages.length > 0); // Only show conversations with messages

  const value = {
    conversations,
    currentConversationId,
    conversationOrder,
    currentMessages,
    conversationsList,
    createNewConversation,
    loadConversation,
    deleteConversation,
    updateMessages
  };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
