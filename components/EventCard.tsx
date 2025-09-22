import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin, Calendar, Users } from 'lucide-react-native';
import { Event } from '@/types/event';
import { useEvents } from '@/hooks/use-events';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const { toggleFavorite } = useEvents();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/event/${event.id}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(event.id);
          }}
        >
          <Heart 
            size={20} 
            color={event.isFavorite ? Colors.accentPink : Colors.textOnPrimary}
            fill={event.isFavorite ? Colors.accentPink : 'transparent'}
          />
        </TouchableOpacity>
        {event.price === 0 && (
          <View style={styles.freeTag}>
            <Text style={styles.freeText}>FREE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category}>{event.category.toUpperCase()}</Text>
          <Text style={styles.ageRange}>Ages {event.ageRange.min}-{event.ageRange.max}</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{formatDate(event.date)} • {event.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.detailRow}>
              <Users size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{event.spotsLeft} spots left</Text>
            </View>
            {event.price > 0 && (
              <View style={styles.priceSection}>
                <Text style={styles.price}>${event.price}</Text>
                <TouchableOpacity 
                  style={styles.buyButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({
                      pathname: '/checkout' as any,
                      params: {
                        eventId: event.id,
                        eventTitle: event.title,
                        amount: event.price.toString()
                      }
                    });
                  }}
                >
                  <Text style={styles.buyButtonText}>Buy Tickets</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.sm,
  },
  freeTag: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  freeText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  category: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
    letterSpacing: 0.8,
    backgroundColor: Colors.brandSurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  ageRange: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeights.normal * Typography.fontSizes.lg,
  },
  details: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  price: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buyButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
});