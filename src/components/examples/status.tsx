'use client';

import {
  Chat,
  ChatInput,
  MessageStatus,
  SessionMessage,
  SessionMessagePanel,
  SessionMessages,
  SessionMessagesHeader,
} from "reachat";

export function StatusExample() {
  return (
    <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#02020F', padding: 20, borderRadius: 5, margin: '20px auto' }}>
      <MessageStatus
        status="loading"
        text="Running analysis"
        steps={[
          { id: '1', text: 'Loading dataset', status: 'complete' },
          { id: '2', text: 'Computing statistics', status: 'complete' },
          { id: '3', text: 'Generating insights', status: 'loading' }
        ]}
      />
    </div>
  );
}
