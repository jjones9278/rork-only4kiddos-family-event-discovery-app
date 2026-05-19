import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { BrandedButton } from './BrandedButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = "Something went wrong. Please try again.",
  onRetry 
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertCircle size={48} color={Colors.error} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <BrandedButton
          title="Try Again"
          onPress={onRetry}
          style={styles.retryButton}
          icon={<RefreshCw size={16} color={Colors.textOnPrimary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.base,
  },
  retryButton: {
    minWidth: 120,
  },
});