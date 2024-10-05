import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface DebugOverlayProps {
  messages: string[];
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ messages }) => {
  return (
    <View style={styles.overlay}>
      <ScrollView>
        {messages.map((message, index) => (
          <Text key={index} style={styles.message}>{message}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    maxHeight: 200,
    padding: 10,
  },
  message: {
    color: 'white',
    fontSize: 12,
  },
});

export default DebugOverlay;