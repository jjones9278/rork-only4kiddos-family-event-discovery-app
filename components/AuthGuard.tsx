import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LogIn, Lock } from 'lucide-react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useAuth } from '@/context/AuthContext';
import { BrandedSpinner } from './BrandedSpinner';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

// Diagnostic label rendered under the Sign In button. `embedded` means the
// originally-built bundle from `eas build` is running; a UUID means an OTA
// update from `eas update` is active. Different UUID = different OTA push.
const APP_VERSION = Constants.expoConfig?.version ?? '?';
const UPDATE_ID = Updates.updateId ? Updates.updateId.slice(0, 8) : 'embedded';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

// Renders children when the current auth state matches `requireAuth`.
// When unauthenticated and auth IS required, shows an inline sign-in prompt
// (with a button that pushes /login as a modal) rather than redirecting —
// this preserves the tab bar so the user can still switch to other tabs.
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BrandedSpinner />
      </View>
    );
  }

  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // requireAuth && !user — show inline prompt instead of redirecting.
  return (
    <View style={styles.promptContainer}>
      <View style={styles.iconBadge}>
        <Lock size={28} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Sign in required</Text>
      <Text style={styles.subtitle}>
        Sign in to view your profile, children, bookings, and favorites.
      </Text>
      <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/login' as any)}>
        <LogIn size={18} color={Colors.textOnPrimary} />
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <Text style={styles.versionText}>v{APP_VERSION} • {UPDATE_ID}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.brandBackground,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    backgroundColor: Colors.brandBackground,
    gap: Spacing.lg,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.brandSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSizes.base * 1.5,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  signInButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
  versionText: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizes.xs,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
});
