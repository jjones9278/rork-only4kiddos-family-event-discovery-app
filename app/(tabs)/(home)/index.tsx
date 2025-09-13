import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SlidersHorizontal, Sparkles, Heart } from 'lucide-react-native';
import { EventCard } from '@/components/EventCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { BrandedHeader } from '@/components/BrandedHeader';
import { useEvents } from '@/hooks/use-events';
import { EventCategory } from '@/types/event';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

export default function HomeScreen() {
  const { events, filters, setFilters, isLoading } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);

  const handleCategoryToggle = (category: EventCategory) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(updated);
    setFilters({ ...filters, categories: updated.length > 0 ? updated : undefined });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const ListHeader = () => (
    <View>
      <BrandedHeader 
        onLocationPress={() => console.log('Location pressed')}
        onNotificationPress={() => console.log('Notifications pressed')}
      />
      
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeTextContainer}>
          <Sparkles size={24} color={Colors.accent} style={styles.sparkleIcon} />
          <Text style={styles.welcomeText}>Find amazing events</Text>
        </View>
        <Text style={styles.welcomeSubtext}>for your little ones</Text>
        <View style={styles.brandAccent} />
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Browse by Category</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => router.push('/filters')}
          >
            <SlidersHorizontal size={18} color={Colors.primary} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
        <CategoryFilter 
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Heart size={48} color={Colors.textTertiary} />
      <Text style={styles.emptyText}>No events found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters or check back later for new events!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.secondary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandBackground,
  },
  welcomeContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  welcomeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sparkleIcon: {
    marginRight: Spacing.sm,
  },
  welcomeText: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeights.tight * Typography.fontSizes['3xl'],
  },
  welcomeSubtext: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    lineHeight: Typography.lineHeights.tight * Typography.fontSizes['3xl'],
    marginBottom: Spacing.md,
  },
  brandAccent: {
    height: 4,
    width: 60,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
  },
  filterSection: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: Spacing['4xl'],
  },
  emptyText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.sm,
  },
});