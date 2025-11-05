import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  role: 'user' | 'bot';
  text: string;
};

export function ChatBubble({ role, text }: Props) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? '#00a8f7' : '#e5e7eb',
            borderTopRightRadius: isUser ? 4 : 16,
            borderTopLeftRadius: isUser ? 16 : 4,
          },
        ]}
      >
        <Text style={{ color: isUser ? '#fff' : '#1f2937' }}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 12 },
  bubble: { maxWidth: '70%', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
});

export default ChatBubble;


