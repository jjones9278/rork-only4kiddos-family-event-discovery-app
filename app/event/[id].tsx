import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, MapPin, Users, Clock, Heart, Share2, DollarSign, Tag, Accessibility } from 'lucide-react-native';
import { useEventById, useChildren, useToggleFavorite, useCreateBooking } from '@/hooks/use-events-trpc';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useToastHelpers } from '@/components/ToastProvider';
import { ChildAvatar } from '@/components/ChildAvatar';
import { EventMap } from '@/components/EventMap';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const { toastSuccess, toastError } = useToastHelpers();
  
  // Use tRPC hooks for data fetching
  const { data: event, isLoading: eventLoading, isError: eventError, refetch: refetchEvent } = useEventById(id as string);
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const toggleFavorite = useToggleFavorite();
  const createBooking = useCreateBooking();

  // Show loading state
  if (eventLoading) {
    return <LoadingState label="Loading event details..." />;
  }

  // Show error state
  if (eventError || !event) {
    return <ErrorState message="Event not found or unable to load details." onRetry={refetchEvent} />;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildren(prev =>
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleBooking = async () => {
    if (selectedChildren.length === 0) {
      Alert.alert('Select Children', 'Please select at least one child for this event');
      return;
    }

    try {
      await createBooking.mutateAsync({
        eventId: event.id,
        childIds: selectedChildren,
      });
      
      toastSuccess(
        'Booking Confirmed!',
        `Successfully booked ${event.title} for ${selectedChildren.length} child${selectedChildren.length > 1 ? 'ren' : ''}.`
      );
      router.back();
    } catch (error) {
      toastError('Booking Failed', 'Unable to complete booking. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: event.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => toggleFavorite.mutate({ eventId: event.id })}
              disabled={toggleFavorite.isPending}
            >
              <Heart 
                size={24} 
                color={event.isFavorite ? '#FF6B6B' : '#9CA3AF'}
                fill={event.isFavorite ? '#FF6B6B' : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Share2 size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.hostContainer}>
          <Image source={{ uri: event.hostImage }} style={styles.hostImage} />
          <View>
            <Text style={styles.hostLabel}>Hosted by</Text>
            <Text style={styles.hostName}>{event.hostName}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Calendar size={20} color="#7C3AED" />
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoText}>{formatDate(event.date)}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Clock size={20} color="#7C3AED" />
            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoText}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MapPin size={20} color="#7C3AED" />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoText}>{event.location}</Text>
              <Text style={styles.infoSubtext}>{event.address}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Users size={20} color="#7C3AED" />
            <View>
              <Text style={styles.infoLabel}>Capacity</Text>
              <Text style={styles.infoText}>{event.spotsLeft} of {event.capacity} spots left</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <DollarSign size={20} color="#7C3AED" />
            <View>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoText}>
                {event.price === 0 ? 'FREE' : `$${event.price} per child`}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Users size={20} color="#7C3AED" />
            <View>
              <Text style={styles.infoLabel}>Age Range</Text>
              <Text style={styles.infoText}>{event.ageRange.min}-{event.ageRange.max} years</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <EventMap event={event} height={250} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {event.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag size={20} color="#7C3AED" />
              <Text style={styles.sectionTitle}>Tags</Text>
            </View>
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {event.accessibilityFeatures.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Accessibility size={20} color="#7C3AED" />
              <Text style={styles.sectionTitle}>Accessibility</Text>
            </View>
            {event.accessibilityFeatures.map((feature, index) => (
              <Text key={index} style={styles.accessibilityItem}>• {feature}</Text>
            ))}
          </View>
        )}

        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select children to book</Text>
            <View style={styles.childrenList}>
              {children.map((child: any) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childItem,
                    selectedChildren.includes(child.id) && styles.childItemSelected
                  ]}
                  onPress={() => toggleChildSelection(child.id)}
                >
                  <ChildAvatar child={child} size={40} selected={selectedChildren.includes(child.id)} />
                  <Text style={styles.childItemName}>{child.name}</Text>
                  <Text style={styles.childItemAge}>Age {child.age}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
        <View style={styles.bookingBar}>
          <View>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.priceValue}>
              {event.price === 0 
                ? 'FREE' 
                : `$${event.price * selectedChildren.length}`}
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.bookButton,
              (event.spotsLeft === 0 || createBooking.isPending) && styles.bookButtonDisabled
            ]}
            onPress={handleBooking}
            disabled={event.spotsLeft === 0 || createBooking.isPending}
          >
            <Text style={styles.bookButtonText}>
              {createBooking.isPending 
                ? 'Booking...' 
                : event.spotsLeft === 0 
                  ? 'Fully Booked' 
                  : 'Book Now'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hostImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  hostLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoGrid: {
    gap: 20,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  accessibilityItem: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  childrenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  childItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    minWidth: 100,
  },
  childItemSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  childItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  childItemAge: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bookButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});