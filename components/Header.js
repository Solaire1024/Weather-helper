import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';

export default function Header({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});