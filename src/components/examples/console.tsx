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

export function ConsoleExample() {
  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#02020F', padding: 20, borderRadius: 5, margin: '20px 0' }}>
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
        viewType="console"
        onDeleteSession={() => alert("delete!")}
      >
        <SessionsList>
          <NewSessionButton />
          <SessionGroups />
        </SessionsList>
        <SessionMessagePanel>
          <SessionMessagesHeader />
          <SessionMessages />
          <ChatInput />
        </SessionMessagePanel>
      </Chat>
    </div>
  );
}
