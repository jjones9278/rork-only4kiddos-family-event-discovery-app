// Map-free venue display. We deliberately do NOT use react-native-maps because
// it native-links Google Play Services Location on Android, which Google Play's
// scanner flags for the children-under-13 target audience. This component
// shows the venue name + address and offers an "Open in Maps" button that
// hands the URL to the OS via Linking — no location SDK, no permissions.
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { MapPin, ExternalLink } from 'lucide-react-native';
import { Event } from '@/types/event';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface EventMapProps {
  event: Event;
  height?: number;            // accepted for API compat; unused now
  showDirectionsButton?: boolean;
}

export function EventMap({ event, showDirectionsButton = true }: EventMapProps) {
  const openInMaps = async () => {
    const query = encodeURIComponent(
      event.address ||
      event.location ||
      (event.latitude != null && event.longitude != null ? `${event.latitude},${event.longitude}` : ''),
    );
    if (!query) return;
    const nativeUrl = Platform.select({
      ios: `maps://?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    try {
      const canOpen = nativeUrl ? await Linking.canOpenURL(nativeUrl) : false;
      await Linking.openURL(canOpen ? nativeUrl! : fallbackUrl);
    } catch {
      // Swallow — never crash the app from a maps tap.
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <MapPin size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.locationName} numberOfLines={2}>{event.location || 'Venue'}</Text>
          {event.address && event.address !== event.location ? (
            <Text style={styles.locationAddress} numberOfLines={3}>{event.address}</Text>
          ) : null}
        </View>
      </View>

      {showDirectionsButton ? (
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={openInMaps}
          accessibilityRole="button"
          accessibilityLabel="Open venue in Maps"
        >
          <ExternalLink size={16} color={Colors.textOnPrimary} />
          <Text style={styles.directionsText}>Open in Maps</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.brandSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  locationName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  locationAddress: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.sm,
  },
  directionsButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  directionsText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
});
