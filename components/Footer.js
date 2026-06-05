import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer({ authorName }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>© 2026 {authorName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    width: '100%',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
});