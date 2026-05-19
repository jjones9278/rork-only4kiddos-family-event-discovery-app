import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { BrandedSpinner } from './BrandedSpinner';
import { Colors } from '@/constants/colors';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function AuthGuard({ 
  children, 
  redirectTo = '/login', 
  requireAuth = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User needs to be authenticated but isn't
        router.replace(redirectTo as any);
      } else if (!requireAuth && user) {
        // User shouldn't be authenticated but is (e.g., login page when already logged in)
        router.replace('/(tabs)' as any);
      }
    }
  }, [user, loading, requireAuth, redirectTo]);

  // Show loading spinner while determining auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BrandedSpinner />
      </View>
    );
  }

  // Show content if auth state matches requirement
  if ((requireAuth && user) || (!requireAuth && !user)) {
    return <>{children}</>;
  }

  // Return loading view while redirect is happening
  return (
    <View style={styles.loadingContainer}>
      <BrandedSpinner />
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
});