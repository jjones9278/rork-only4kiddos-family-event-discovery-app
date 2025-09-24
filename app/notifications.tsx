import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Bell, BellRing, TestTube, Settings } from 'lucide-react-native';
import { useNotificationContext } from '@/context/NotificationContext';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';
import AccessiblePressable from '@/components/AccessiblePressable';

export default function NotificationsScreen() {
  const {
    permissions,
    expoPushToken,
    requestPermissions,
    sendTestNotification,
    clearAllNotifications,
    isLoading
  } = useNotificationContext();

  const [eventNotifications, setEventNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert(
        '✅ Notifications Enabled',
        'You\'ll now receive important updates about events and bookings!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '❌ Permission Denied',
        'Please enable notifications in your device settings to receive updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => console.log('Open settings') }
        ]
      );
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllNotifications }
      ]
    );
  };

  const getPermissionStatus = () => {
    if (!permissions) return 'Unknown';
    return permissions.status === 'granted' ? 'Enabled' : 'Disabled';
  };

  const getPermissionColor = () => {
    if (!permissions) return Colors.textSecondary;
    return permissions.status === 'granted' ? Colors.success : Colors.error;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <AccessiblePressable 
          accessibilityLabel="Close"
          onPress={() => router.back()}
        >
          <X size={24} color={Colors.textPrimary} />
        </AccessiblePressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Bell size={24} color={getPermissionColor()} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Notification Status</Text>
              <Text style={[styles.statusValue, { color: getPermissionColor() }]}>
                {getPermissionStatus()}
              </Text>
            </View>
          </View>
          
          {permissions?.status !== 'granted' && (
            <TouchableOpacity 
              style={styles.enableButton}
              onPress={handleRequestPermissions}
              disabled={isLoading}
            >
              <BellRing size={16} color={Colors.textOnPrimary} />
              <Text style={styles.enableButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Push Token Info (for debugging) */}
        {expoPushToken && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Push Token</Text>
            <Text style={styles.debugText} numberOfLines={3} ellipsizeMode="middle">
              {expoPushToken}
            </Text>
          </View>
        )}

        {/* Notification Preferences */}
        <View style={styles.preferencesCard}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>New Events</Text>
            <Switch
              value={eventNotifications}
              onValueChange={setEventNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={eventNotifications ? Colors.textOnPrimary : Colors.textSecondary}
            />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Booking Reminders</Text>
            <Switch
              value={bookingReminders}
              onValueChange={setBookingReminders}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={bookingReminders ? Colors.textOnPrimary : Colors.textSecondary}
            />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>News & Updates</Text>
            <Switch
              value={newsUpdates}
              onValueChange={setNewsUpdates}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={newsUpdates ? Colors.textOnPrimary : Colors.textSecondary}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Test & Manage</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleTestNotification}
            disabled={permissions?.status !== 'granted' || isLoading}
          >
            <TestTube size={16} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Send Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonDestructive]}
            onPress={handleClearAll}
          >
            <X size={16} color={Colors.error} />
            <Text style={[styles.actionButtonText, { color: Colors.error }]}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>About Notifications</Text>
          <Text style={styles.helpText}>
            Stay updated with push notifications about new family events, booking confirmations, 
            and reminders. You can customize which types of notifications you receive at any time.
          </Text>
          <Text style={styles.helpText}>
            For the best experience, we recommend keeping event and booking notifications enabled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  statusTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statusValue: {
    ...Typography.body2,
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  enableButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  debugCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  debugText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  preferencesCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  preferenceLabel: {
    ...Typography.body1,
    color: Colors.textPrimary,
  },
  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  actionButtonDestructive: {
    borderColor: Colors.errorBorder,
    backgroundColor: Colors.errorBackground,
  },
  actionButtonText: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  helpCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  helpTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  helpText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
});