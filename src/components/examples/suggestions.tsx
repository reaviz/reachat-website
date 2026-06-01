'use client';

import {
  Chat,
  ChatInput,
  ChatSuggestions,
  SessionMessage,
  SessionMessagePanel,
  SessionMessages,
  SessionMessagesHeader,
} from "reachat";

export function SuggestionsExample() {
  return (
    <div style={{ width: 350, height: '500px', backgroundColor: '#02020F', padding: 20, borderRadius: 5, margin: '20px auto' }}>
      <Chat
        sessions={[
          {
            id: '1',
            title: 'New Chat',
            createdAt: new Date('2024-01-15T10:00:00Z'),
            updatedAt: new Date('2024-01-15T10:00:00Z'),
            conversations: []
          }
        ]}
        activeSessionId="1"
        viewType="chat"
      >
        <SessionMessagePanel>
          <SessionMessagesHeader />
          <SessionMessages />
          <ChatSuggestions
            suggestions={[
              { id: '1', content: 'Explain how React works' },
              { id: '2', content: 'Write a sorting algorithm' },
              { id: '3', content: 'Review my code' }
            ]}
            onSuggestionClick={(content) => alert(`Sending: ${content}`)}
          />
          <ChatInput />
        </SessionMessagePanel>
      </Chat>
    </div>
  );
}
