import React, { useState } from 'react';
import { formatRelativeTime } from '../utils/dateUtils';
import { Trash2 } from 'lucide-react';

export default function ConversationItem({ conversation, onSelect, onDelete, colorIndex, animationDelay = 0 }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(conversation.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const messageCount = conversation.messages.length;
  const relativeTime = formatRelativeTime(conversation.updatedAt);

  // Alternate between red and teal like the quick action buttons
  const isTeal = colorIndex % 2 === 1;
  const bgClass = isTeal
    ? 'bg-teal-50/70 dark:bg-kit-teal-dark/10 hover:bg-teal-50/90 dark:hover:bg-kit-teal-dark/20'
    : 'bg-red-50/70 dark:bg-kit-red-dark/10 hover:bg-red-50/90 dark:hover:bg-kit-red-dark/20';

  return (
    <div
      className={`
        group p-4 md:p-5 rounded-3xl cursor-pointer text-left shadow-sm
        hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-slideIn
        ${bgClass}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onSelect(conversation.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDeleteConfirm(false);
      }}
    >
      {showDeleteConfirm ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            Delete this conversation?
          </p>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            Delete
          </button>
          <button
            onClick={handleCancelDelete}
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-bold text-gray-800 dark:text-kit-dark-text text-base md:text-lg transition-colors duration-300 flex-1 truncate">
              {conversation.title || 'New Chat'}
            </span>
            {/* Always visible on mobile (no hover), hover-only on desktop */}
            <button
              onClick={handleDelete}
              className={`flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-md ${
                isHovered ? 'md:opacity-100' : 'md:opacity-0'
              } md:group-hover:opacity-100`}
              title="Delete conversation"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <p className="text-sm md:text-base text-gray-600 dark:text-kit-dark-text-muted transition-colors duration-300">
            {relativeTime} • {messageCount} {messageCount === 1 ? 'message' : 'messages'}
          </p>
        </>
      )}
    </div>
  );
}
