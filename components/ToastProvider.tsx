// Toast notification system for Only4kiddos
import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '@/constants/colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Individual Toast Item Component
function ToastItem({ toast, onHide }: { toast: Toast; onHide: (id: string) => void }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  React.useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        hideToast();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  }, [toast.id, onHide]);

  const getIconAndColor = () => {
    switch (toast.type) {
      case 'success':
        return { Icon: CheckCircle, color: Colors.success };
      case 'error':
        return { Icon: XCircle, color: Colors.error };
      case 'warning':
        return { Icon: AlertCircle, color: Colors.warning };
      case 'info':
      default:
        return { Icon: Info, color: Colors.info };
    }
  };

  const { Icon, color } = getIconAndColor();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        styles[toast.type],
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Icon size={24} color={color} style={styles.toastIcon} />
        <View style={styles.toastText}>
          <Text style={[styles.toastTitle, { color }]}>{toast.title}</Text>
          {toast.message && (
            <Text style={styles.toastMessage}>{toast.message}</Text>
          )}
          {toast.action && (
            <TouchableOpacity
              style={styles.toastAction}
              onPress={toast.action.onPress}
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
            >
              <Text style={[styles.toastActionText, { color }]}>
                {toast.action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
          accessibilityRole="button"
          accessibilityLabel="Close notification"
        >
          <X size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? 4000, // Default 4 seconds
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after a longer duration as fallback
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, (newToast.duration || 4000) + 1000);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 6000 }); // Longer for errors
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message, duration: 5000 });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.length > 0 && (
        <View style={styles.toastOverlay}>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onHide={hideToast}
            />
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastOverlay: {
    position: 'absolute',
    top: 60, // Below status bar and header
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toastContainer: {
    marginBottom: Spacing.sm,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  success: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  warning: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  info: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    minHeight: 60,
  },
  toastIcon: {
    marginTop: 2,
    marginRight: Spacing.sm,
  },
  toastText: {
    flex: 1,
  },
  toastTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.normal * Typography.fontSizes.sm,
  },
  toastAction: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  toastActionText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    textDecorationLine: 'underline',
  },
  closeButton: {
    marginLeft: Spacing.sm,
    padding: 2,
  },
});

// Hook for common toast patterns
export function useToastHelpers() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return {
    toastSuccess: showSuccess,
    toastError: showError,
    toastWarning: showWarning,
    toastInfo: showInfo,
    
    // Common patterns
    toastMutationSuccess: (action: string) => {
      showSuccess('Success!', `${action} completed successfully.`);
    },
    
    toastMutationError: (action: string, error?: string) => {
      showError('Error', error || `Failed to ${action.toLowerCase()}. Please try again.`);
    },
    
    toastNetworkError: () => {
      showError('Connection Error', 'Please check your internet connection and try again.');
    },
    
    toastBookingSuccess: () => {
      showSuccess('Booking Confirmed!', 'Your event booking has been confirmed.');
    },
    
    toastFavoriteAdded: () => {
      showSuccess('Added to Favorites', 'Event saved to your favorites.');
    },
    
    toastFavoriteRemoved: () => {
      showInfo('Removed from Favorites', 'Event removed from your favorites.');
    },
  };
}