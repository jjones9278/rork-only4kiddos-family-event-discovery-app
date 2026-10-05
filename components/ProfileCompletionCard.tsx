import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { X, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useFamilyProfile } from '@/hooks/use-events-laravel';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

/**
 * "Complete your family profile" card for the home screen. Shown to
 * signed-in parents who haven't finished family onboarding; tapping it
 * reopens the stepper. Dismissing hides it until the next app launch.
 */
// Module-level so it survives remounts — the home screen's list header is
// recreated on every render (filters, refresh), which would otherwise bring
// a dismissed card right back.
let dismissedThisLaunch = false;

export function ProfileCompletionCard() {
  const { user } = useAuth();
  const { data } = useFamilyProfile(!!user);
  const [dismissed, setDismissed] = useState(dismissedThisLaunch);

  if (!user || !data || data.profileCompleted || dismissed) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push('/family-onboarding' as any)}
      accessibilityRole="button"
      accessibilityLabel={`Complete your family profile, ${data.completion}% complete`}
    >
      <View style={styles.row}>
        <Text style={styles.emoji}>🎒</Text>
        <View style={styles.body}>
          <Text style={styles.title}>Complete your family profile</Text>
          <Text style={styles.text}>{"Add your kids' ages and interests — about a minute."}</Text>
        </View>
        <TouchableOpacity
          onPress={() => { dismissedThisLaunch = true; setDismissed(true); }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${data.completion}%` }]} />
        </View>
        <Text style={styles.percent}>{data.completion}%</Text>
        <Text style={styles.cta}>Finish</Text>
        <ChevronRight size={16} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, padding: Spacing.lg,
    backgroundColor: Colors.brandSurface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  emoji: { fontSize: 28 },
  body: { flex: 1 },
  title: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  text: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  barTrack: { flex: 1, height: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.border, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary },
  percent: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  cta: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.semibold, color: Colors.primary },
});
