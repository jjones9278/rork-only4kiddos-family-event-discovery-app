import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Navigation, ExternalLink } from 'lucide-react-native';
import { Event } from '@/types/event';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface EventMapProps {
  event: Event;
  height?: number;
  showDirectionsButton?: boolean;
}

export function EventMap({ 
  event, 
  height = 200, 
  showDirectionsButton = true 
}: EventMapProps) {
  // Default coordinates for San Francisco if no coordinates are provided
  const latitude = event.latitude || 37.7749;
  const longitude = event.longitude || -122.4194;
  
  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const openDirections = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${event.title})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={event.title}
            description={event.address}
          />
        </MapView>
        
        {showDirectionsButton && (
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={openDirections}
          >
            <Navigation size={16} color={Colors.textOnPrimary} />
            <Text style={styles.directionsText}>Directions</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{event.location}</Text>
        <Text style={styles.locationAddress}>{event.address}</Text>
        
        <TouchableOpacity 
          style={styles.viewInMapsButton}
          onPress={openDirections}
        >
          <ExternalLink size={14} color={Colors.primary} />
          <Text style={styles.viewInMapsText}>View in Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  mapContainer: {
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  directionsButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  locationInfo: {
    padding: Spacing.lg,
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
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.sm,
  },
  viewInMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  viewInMapsText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
});