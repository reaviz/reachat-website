'use client';

import {
  Chat,
  SessionsList,
  SessionsGroup,
  SessionListItem,
  NewSessionButton,
  SessionMessages,
  SessionGroups,
  ChatInput,
  SessionMessagePanel,
  SessionMessagesHeader,
  SessionMessage,
} from "reachat";

export function ChatExample() {
  return (
    <div style={{ width: 350, height: '500px', backgroundColor: '#02020F', padding: 20, borderRadius: 5, margin: '20px auto' }}>
      <Chat
        sessions={[
          {
            id: '1',
            title: 'Session 1',
            createdAt: new Date('2024-01-15T10:00:00Z'),
            updatedAt: new Date('2024-01-15T10:00:00Z'),
            conversations: [
              {
                id: '1',
                question: 'What is React?',
                response: 'React is a JavaScript library for building user interfaces.',
                createdAt: new Date('2024-01-15T10:00:00Z'),
                updatedAt: new Date('2024-01-15T10:00:00Z')
              },
              {
                id: '2',
                question: 'What is JSX?',
                response: 'JSX is a syntax extension for JavaScript.',
                createdAt: new Date('2024-01-15T10:00:00Z'),
                updatedAt: new Date('2024-01-15T10:00:00Z')
              }
            ]
          }
        ]}
        activeSessionId="1"
        viewType="chat"
        onDeleteSession={() => alert("delete!")}
      >
        <SessionMessagePanel>
          <SessionMessagesHeader />
          <SessionMessages>
            {(conversations) =>
              conversations.map((conversation) => (
                <SessionMessage
                  key={conversation.id}
                  conversation={conversation}
                />
              ))
            }
          </SessionMessages>
          <ChatInput />
        </SessionMessagePanel>
      </Chat>
    </div>
  );
}
