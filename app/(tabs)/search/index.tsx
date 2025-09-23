import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Search, X, Sparkles, TrendingUp } from 'lucide-react-native';
import { EventCard } from '@/components/EventCard';
import { BrandedHeader } from '@/components/BrandedHeader';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useEventSearch } from '@/hooks/use-events-trpc';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, isError, refetch } = useEventSearch(searchQuery);
  const events = data?.items || [];

  const popularSearches = ['Art Classes', 'Swimming', 'Birthday Parties', 'Music Lessons', 'Sports'];

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      {searchQuery ? (
        <>
          <Search size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No events found</Text>
          <Text style={styles.emptySubtext}>Try different keywords or check back later</Text>
        </>
      ) : (
        <>
          <Sparkles size={48} color={Colors.primary} />
          <Text style={styles.emptyText}>Discover Amazing Events</Text>
          <Text style={styles.emptySubtext}>Search by name, location, or activity type</Text>
          
          <View style={styles.popularSearches}>
            <View style={styles.popularHeader}>
              <TrendingUp size={16} color={Colors.textSecondary} />
              <Text style={styles.popularTitle}>Popular Searches</Text>
            </View>
            <View style={styles.popularTags}>
              {popularSearches.map((search) => (
                <TouchableOpacity 
                  key={search}
                  style={styles.popularTag}
                  onPress={() => setSearchQuery(search)}
                >
                  <Text style={styles.popularTagText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <BrandedHeader 
        showNotifications={false}
        onLocationPress={() => console.log('Location pressed')}
      />
      
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>Find Your Next Adventure</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, activities, locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.searchAccent} />
      </View>

      {isLoading && searchQuery && events.length === 0 ? (
        <LoadingState label="Searching events..." />
      ) : isError ? (
        <ErrorState message="Unable to search events. Please try again." onRetry={refetch} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandBackground,
  },
  searchSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  searchTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandSurface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  clearButton: {
    padding: Spacing.xs,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.full,
  },
  searchAccent: {
    height: 3,
    width: 40,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.sm,
    alignSelf: 'center',
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing['4xl'],
  },
  emptyText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.base,
    marginBottom: Spacing['2xl'],
  },
  popularSearches: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  popularTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  popularTag: {
    backgroundColor: Colors.brandSurface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  popularTagText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.primary,
  },
});