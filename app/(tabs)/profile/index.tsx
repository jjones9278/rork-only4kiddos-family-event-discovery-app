import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Plus, Calendar, Heart, Settings, ChevronRight, Edit2, Trash2, Star, Award, Crown, Mail, LogOut } from 'lucide-react-native';
import { useChildren, useFavoriteEvents, useUpcomingBookings, useDeleteChild } from '@/hooks/use-events-trpc';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useToastHelpers } from '@/components/ToastProvider';
import { ChildAvatar } from '@/components/ChildAvatar';
import { BrandLogo } from '@/components/BrandLogo';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

export default function ProfileScreen() {
  const { data: children = [], isLoading: childrenLoading, isError: childrenError, refetch: refetchChildren } = useChildren();
  const { data: favoriteEvents = [], isLoading: favoritesLoading } = useFavoriteEvents();
  const { upcomingBookings } = useUpcomingBookings();
  const deleteChild = useDeleteChild();
  const { user, signOut } = useAuth();
  const { toastSuccess, toastError } = useToastHelpers();

  // Show loading for initial data
  if (childrenLoading && children.length === 0) {
    return <LoadingState label="Loading your profile..." />;
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login' as any);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const handleDeleteChild = (childId: string, childName: string) => {
    Alert.alert(
      'Delete Child Profile',
      `Are you sure you want to delete ${childName}'s profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChild.mutateAsync({ id: childId });
              toastSuccess('Profile Deleted', `${childName}'s profile has been removed.`);
            } catch (error) {
              toastError('Delete Failed', 'Unable to delete profile. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <AuthGuard>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <BrandLogo size="large" showTagline={true} />
          <Text style={styles.userName}>Welcome, {user?.displayName || user?.email || 'Family Member'}!</Text>
          <View style={styles.membershipBadge}>
            <Star size={16} color={Colors.accent} />
            <Text style={styles.membershipText}>Premium Family</Text>
          </View>
        </View>
        <View style={styles.headerAccent} />
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Children</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-child')}
          >
            <Plus size={20} color={Colors.primary} />
            <Text style={styles.addButtonText}>Add Child</Text>
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children added yet</Text>
            <Text style={styles.emptySubtext}>Add your children to personalize event recommendations</Text>
          </View>
        ) : (
          <View style={styles.childrenGrid}>
            {children.map((child: any) => (
              <View key={child.id} style={styles.childCard}>
                <ChildAvatar child={child} size={60} />
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>Age {child.age}</Text>
                <View style={styles.childActions}>
                  <TouchableOpacity style={styles.childActionButton}>
                    <Edit2 size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.childActionButton}
                    onPress={() => handleDeleteChild(child.id, child.name)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <Calendar size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{upcomingBookings?.length || 0}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={[styles.statCard, styles.secondaryStatCard]}>
            <Heart size={24} color={Colors.accentPink} />
            <Text style={styles.statNumber}>{favoriteEvents.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={[styles.statCard, styles.accentStatCard]}>
            <Award size={24} color={Colors.accent} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuItem}>
            <Calendar size={20} color={Colors.textSecondary} />
            <Text style={styles.menuText}>My Bookings</Text>
            <ChevronRight size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Heart size={20} color={Colors.textSecondary} />
            <Text style={styles.menuText}>Saved Events</Text>
            <ChevronRight size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, styles.premiumMenuItem]}
            onPress={() => console.log('Premium feature coming soon')}
          >
            <Crown size={20} color={Colors.accent} />
            <Text style={[styles.menuText, styles.premiumText]}>Upgrade to Premium</Text>
            <ChevronRight size={20} color={Colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => console.log('Newsletter settings coming soon')}
          >
            <Mail size={20} color={Colors.textSecondary} />
            <Text style={styles.menuText}>Email Preferences</Text>
            <ChevronRight size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color={Colors.textSecondary} />
            <Text style={styles.menuText}>Settings</Text>
            <ChevronRight size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, styles.signOutMenuItem]}
            onPress={handleSignOut}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandBackground,
  },
  header: {
    backgroundColor: Colors.brandSurface,
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  membershipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  headerAccent: {
    height: 4,
    width: 80,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  section: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['4xl'],
  },
  emptyText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  childCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '30%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  childName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  childAge: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  childActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  childActionButton: {
    padding: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryStatCard: {
    borderTopWidth: 3,
    borderTopColor: Colors.primary,
  },
  secondaryStatCard: {
    borderTopWidth: 3,
    borderTopColor: Colors.accentPink,
  },
  accentStatCard: {
    borderTopWidth: 3,
    borderTopColor: Colors.accent,
  },
  statNumber: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  menuList: {
    paddingHorizontal: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  premiumMenuItem: {
    backgroundColor: Colors.brandSurface,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  premiumText: {
    color: Colors.accent,
    fontWeight: Typography.fontWeights.semibold,
  },
  userName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  signOutMenuItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  signOutText: {
    color: Colors.error,
  },
});