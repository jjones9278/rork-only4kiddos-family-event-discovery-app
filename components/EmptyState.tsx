import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = { title?: string; message?: string; actionLabel?: string; onPress?: () => void };
export default function EmptyState({ title = 'Nothing here yet', message = 'Try adjusting your filters or come back later.', actionLabel, onPress }: Props) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onPress ? (
        <TouchableOpacity onPress={onPress} style={styles.btn} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  message: { fontSize: 14, opacity: 0.75, textAlign: 'center' },
  btn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#222' },
  btnText: { color: '#fff', fontWeight: '600' },
});