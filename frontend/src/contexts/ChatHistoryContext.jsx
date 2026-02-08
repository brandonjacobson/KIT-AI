import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { generateSmartTitle } from '../utils/dateUtils';

const ChatHistoryContext = createContext();

const STORAGE_KEY = 'kit-ai-chat-history';
const MAX_MESSAGE_COUNT = 100;
const STORAGE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB
const MAX_CONVERSATIONS = 50; // Limit total conversations to prevent bloat
const SAVE_DEBOUNCE_MS = 500;

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
 * Prune conversations to stay within storage limits.
 * Removes oldest conversations (by updatedAt) until under the threshold.
 */
function pruneConversations(conversations, conversationOrder) {
  // If under the max count, no pruning needed
  if (conversationOrder.length <= MAX_CONVERSATIONS) {
    return { conversations, conversationOrder };
  }

  // Keep only the most recent MAX_CONVERSATIONS
  const keptOrder = conversationOrder.slice(0, MAX_CONVERSATIONS);
  const keptSet = new Set(keptOrder);
  const prunedConversations = {};
  for (const id of keptOrder) {
    if (conversations[id]) {
      prunedConversations[id] = conversations[id];
    }
  }

  const removed = conversationOrder.length - keptOrder.length;
  if (removed > 0) {
    console.log(`[ChatHistory] Pruned ${removed} old conversations to stay within limits`);
  }

  return { conversations: prunedConversations, conversationOrder: keptOrder };
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
 * Save chat history to localStorage with automatic pruning on quota errors.
 * Never throws — all errors are handled gracefully.
 */
function saveToStorage(conversations, currentConversationId, conversationOrder) {
  try {
    // Prune before saving to keep storage bounded
    const pruned = pruneConversations(conversations, conversationOrder);

    const data = {
      conversations: pruned.conversations,
      currentConversationId,
      conversationOrder: pruned.conversationOrder
    };

    const serialized = JSON.stringify(data);

    // Check storage size (only warn once per session to avoid spam)
    if (serialized.length > STORAGE_WARNING_THRESHOLD && !saveToStorage._warned) {
      console.warn(`[ChatHistory] Data size (${(serialized.length / 1024 / 1024).toFixed(1)}MB) approaching localStorage limit`);
      saveToStorage._warned = true;
    }

    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('[ChatHistory] Storage quota exceeded, pruning aggressively...');
      // Aggressively prune: keep only the 10 most recent conversations
      try {
        const aggressiveOrder = conversationOrder.slice(0, 10);
        const aggressiveConvs = {};
        for (const id of aggressiveOrder) {
          if (conversations[id]) {
            aggressiveConvs[id] = conversations[id];
          }
        }
        const fallbackData = {
          conversations: aggressiveConvs,
          currentConversationId,
          conversationOrder: aggressiveOrder
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
        console.log('[ChatHistory] Aggressive pruning successful');
      } catch (retryError) {
        // Last resort: clear all history to prevent permanent breakage
        console.error('[ChatHistory] Could not save even after pruning, clearing storage');
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {
          // Nothing we can do
        }
      }
    } else {
      console.error('Failed to save chat history to localStorage:', error);
    }
    // Never throw — the in-memory state is still correct even if persistence fails
  }
}

export function ChatHistoryProvider({ children }) {
  const [conversations, setConversations] = useState({});
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversationOrder, setConversationOrder] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimerRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFromStorage();
    setConversations(loaded.conversations);
    setCurrentConversationId(loaded.currentConversationId);
    setConversationOrder(loaded.conversationOrder);
    setIsInitialized(true);
  }, []);

  // Debounced save to localStorage whenever state changes
  useEffect(() => {
    if (!isInitialized) return;

    // Clear any pending save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Debounce: batch rapid state changes into a single write
    saveTimerRef.current = setTimeout(() => {
      saveToStorage(conversations, currentConversationId, conversationOrder);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [conversations, currentConversationId, conversationOrder, isInitialized]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // Synchronous final save on unmount
        saveToStorage(conversations, currentConversationId, conversationOrder);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Create a new empty conversation
   */
  const createNewConversation = useCallback(() => {
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
  }, []);

  /**
   * Load an existing conversation
   */
  const loadConversation = useCallback((id) => {
    setConversations(prev => {
      if (prev[id]) {
        // Use a microtask to set the ID after we've confirmed it exists
        setCurrentConversationId(id);
      } else {
        console.error(`Conversation ${id} not found`);
      }
      return prev; // No change to conversations
    });
  }, []);

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback((id) => {
    // Remove from conversations
    setConversations(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    // Remove from order
    setConversationOrder(prev => prev.filter(convId => convId !== id));

    // If deleting current conversation, switch to another
    setCurrentConversationId(prevId => {
      if (id !== prevId) return prevId;
      // Need to find another conversation
      // We'll rely on conversationOrder for this
      return null; // Will be handled by an effect or the next render
    });

    setConversationOrder(prev => {
      const remaining = prev.filter(convId => convId !== id);
      if (remaining.length > 0) {
        // Switch to the next conversation
        setCurrentConversationId(remaining[0]);
      } else {
        // No conversations left — will show welcome screen
        setCurrentConversationId(null);
      }
      return remaining;
    });
  }, []);

  /**
   * Add a message to the current conversation
   * @param {Object} newMessage - The message to add
   * @param {string} [conversationId] - Optional conversation ID to use (bypasses async state issue)
   */
  const updateMessages = useCallback((newMessage, conversationId = null) => {
    const now = Date.now();
    const messageWithTimestamp = {
      ...newMessage,
      timestamp: now
    };

    setConversations(prev => {
      // Resolve target ID: prefer explicit param, fall back to current
      const targetId = conversationId || currentConversationId;
      if (!targetId) {
        console.warn('No conversation ID available, message not added');
        return prev;
      }

      const conversation = prev[targetId];
      if (!conversation) {
        console.warn(`Conversation ${targetId} not found, message not added`);
        return prev;
      }

      const updatedMessages = [...conversation.messages, messageWithTimestamp];
      const limitedMessages = updatedMessages.slice(-MAX_MESSAGE_COUNT);

      let title = conversation.title;
      if (!title && newMessage.role === 'user') {
        title = generateSmartTitle(newMessage.content);
      }

      return {
        ...prev,
        [targetId]: {
          ...conversation,
          title,
          updatedAt: now,
          messages: limitedMessages
        }
      };
    });

    // Update order to move this conversation to the top
    const targetId = conversationId || currentConversationId;
    if (targetId) {
      setConversationOrder(prev => {
        const filtered = prev.filter(id => id !== targetId);
        return [targetId, ...filtered];
      });
    }
  }, [currentConversationId]);

  /**
   * Get messages for the current conversation — memoized to avoid new array refs
   */
  const currentMessages = useMemo(() => {
    if (currentConversationId && conversations[currentConversationId]) {
      return conversations[currentConversationId].messages;
    }
    return [];
  }, [currentConversationId, conversations]);

  /**
   * Get ordered list of conversations for display — memoized
   */
  const conversationsList = useMemo(() => {
    return conversationOrder
      .map(id => conversations[id])
      .filter(Boolean)
      .filter(conv => conv.messages.length > 0);
  }, [conversationOrder, conversations]);

  const value = useMemo(() => ({
    conversations,
    currentConversationId,
    conversationOrder,
    currentMessages,
    conversationsList,
    createNewConversation,
    loadConversation,
    deleteConversation,
    updateMessages
  }), [
    conversations,
    currentConversationId,
    conversationOrder,
    currentMessages,
    conversationsList,
    createNewConversation,
    loadConversation,
    deleteConversation,
    updateMessages
  ]);

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
