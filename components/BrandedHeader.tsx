import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { BrandLogo } from './BrandLogo';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface BrandedHeaderProps {
  location?: string;
  showNotifications?: boolean;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
}

export function BrandedHeader({ 
  location = 'San Francisco, CA', 
  showNotifications = true,
  onLocationPress,
  onNotificationPress 
}: BrandedHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <BrandLogo size="medium" variant="full" />
        <View style={styles.rightSection}>
          {showNotifications && (
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={onNotificationPress || (() => router.push('/notifications'))}
            >
              <Bell size={20} color={Colors.textSecondary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.locationContainer}
        onPress={onLocationPress}
      >
        <MapPin size={16} color={Colors.primary} />
        <Text style={styles.locationText}>{location}</Text>
      </TouchableOpacity>
      
      <View style={styles.brandBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brandSurface,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: Colors.accentPink,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  locationText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  brandBar: {
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});