import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function CreateTab() {
  useFocusEffect(
    React.useCallback(() => {
      router.replace('/create-event');
    }, [])
  );

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});