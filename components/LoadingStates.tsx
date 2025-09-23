// Loading, Error, and Empty state components for Only4kiddos
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RefreshCw, AlertCircle, Calendar, Search } from 'lucide-react-native';
import { BrandedButton } from './BrandedButton';
import { Colors, Typography, Spacing } from '@/constants/colors';

// Loading state component
interface LoadingStateProps {
  label?: string;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingState({ 
  label = 'Loading...', 
  size = 'large',
  color = Colors.primary 
}: LoadingStateProps) {
  return (
    <View style={[styles.container, styles.loadingContainer]}>
      <ActivityIndicator 
        size={size} 
        color={color}
        style={styles.spinner}
      />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

// Error state component
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}

export function ErrorState({ 
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  showIcon = true,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, styles.errorContainer]}>
      {showIcon && (
        <AlertCircle 
          size={48} 
          color={Colors.error} 
          style={styles.errorIcon}
        />
      )}
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <BrandedButton
          title={retryLabel}
          onPress={onRetry}
          variant="outline"
          icon={RefreshCw}
          style={styles.retryButton}
        />
      )}
    </View>
  );
}

// Empty state component
interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
  iconSize?: number;
  iconColor?: string;
}

export function EmptyState({ 
  title,
  message,
  actionLabel,
  onAction,
  icon: Icon = Calendar,
  iconSize = 64,
  iconColor = Colors.textSecondary,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, styles.emptyContainer]}>
      <Icon 
        size={iconSize} 
        color={iconColor} 
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction && (
        <BrandedButton
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

// Specific empty states for different sections
export function NoEventsFound({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      title="No events found"
      message="We couldn't find any events matching your criteria. Try adjusting your filters or search terms."
      actionLabel={onClearFilters ? "Clear Filters" : undefined}
      onAction={onClearFilters}
      icon={Search}
    />
  );
}

export function NoFavorites({ onBrowseEvents }: { onBrowseEvents?: () => void }) {
  return (
    <EmptyState
      title="No favorites yet"
      message="Start exploring events and tap the heart icon to save your favorites here."
      actionLabel={onBrowseEvents ? "Browse Events" : undefined}
      onAction={onBrowseEvents}
      icon={Calendar}
    />
  );
}

export function NoBookings({ onBrowseEvents }: { onBrowseEvents?: () => void }) {
  return (
    <EmptyState
      title="No bookings yet"
      message="When you book events for your family, they'll appear here."
      actionLabel={onBrowseEvents ? "Find Events" : undefined}
      onAction={onBrowseEvents}
      icon={Calendar}
    />
  );
}

export function NoChildren({ onAddChild }: { onAddChild?: () => void }) {
  return (
    <EmptyState
      title="Add your first child"
      message="Add your children's profiles to book events and get personalized recommendations."
      actionLabel={onAddChild ? "Add Child" : undefined}
      onAction={onAddChild}
    />
  );
}

// Inline loading component for smaller spaces
export function InlineLoading({ label }: { label?: string }) {
  return (
    <View style={styles.inlineLoading}>
      <ActivityIndicator size="small" color={Colors.primary} />
      {label && <Text style={styles.inlineLoadingText}>{label}</Text>}
    </View>
  );
}

// Skeleton loading component for cards
export function SkeletonCard() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonTextShort} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  
  // Loading styles
  loadingContainer: {
    backgroundColor: Colors.brandBackground,
  },
  spinner: {
    marginBottom: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.medium,
  },
  
  // Error styles
  errorContainer: {
    backgroundColor: Colors.brandBackground,
  },
  errorIcon: {
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSizes.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
  
  // Empty styles
  emptyContainer: {
    backgroundColor: Colors.brandBackground,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    minWidth: 140,
  },
  
  // Inline loading
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  inlineLoadingText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  
  // Skeleton styles
  skeleton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 200,
    backgroundColor: Colors.cardBackground,
  },
  skeletonContent: {
    padding: Spacing.md,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  skeletonText: {
    height: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    marginBottom: Spacing.xs,
    width: '100%',
  },
  skeletonTextShort: {
    height: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    width: '60%',
  },
});

// Export all components
export {
  LoadingState,
  ErrorState,
  EmptyState,
  NoEventsFound,
  NoFavorites,
  NoBookings,
  NoChildren,
  InlineLoading,
  SkeletonCard,
};