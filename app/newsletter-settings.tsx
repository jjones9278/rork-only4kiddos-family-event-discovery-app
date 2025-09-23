import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Mail, Bell, Heart, Calendar, Award } from 'lucide-react-native';
import { NewsletterSubscription } from '@/components/NewsletterSubscription';
import { BrandedButton } from '@/components/BrandedButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  subscriptionType: 'family_events' | 'category_updates' | 'premium_member';
}

export default function NewsletterSettingsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'weekly_digest',
      title: 'Weekly Event Digest',
      description: 'Get a curated list of family events every week',
      icon: <Calendar size={20} color={Colors.primary} />,
      enabled: true,
      subscriptionType: 'family_events',
    },
    {
      id: 'new_events',
      title: 'New Event Alerts',
      description: 'Be the first to know about new family events',
      icon: <Bell size={20} color={Colors.accent} />,
      enabled: false,
      subscriptionType: 'family_events',
    },
    {
      id: 'favorites',
      title: 'Favorite Categories',
      description: 'Updates on events in your favorite categories',
      icon: <Heart size={20} color={Colors.accentPink} />,
      enabled: false,
      subscriptionType: 'category_updates',
    },
    {
      id: 'premium_tips',
      title: 'Premium Family Tips',
      description: 'Exclusive parenting tips and family activity ideas',
      icon: <Award size={20} color={Colors.accent} />,
      enabled: false,
      subscriptionType: 'premium_member',
    },
  ]);

  const togglePreference = (id: string) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const handleSavePreferences = () => {
    // In a real app, you would sync these preferences with your backend
    Alert.alert(
      'Preferences Saved',
      'Your email notification preferences have been updated!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Email Preferences' }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Mail size={32} color={Colors.primary} />
          <Text style={styles.headerTitle}>Email Preferences</Text>
          <Text style={styles.headerSubtitle}>
            Choose what family event updates you'd like to receive
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscribe to Updates</Text>
          <NewsletterSubscription
            title="Join Our Family Community"
            description="Get personalized event recommendations and family activity tips"
            subscriptionType="family_events"
            showTitle={false}
            onSuccess={(email) => {
              console.log('Newsletter subscription successful:', email);
            }}
            onError={(error) => {
              console.log('Newsletter subscription error:', error);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionDescription}>
            Customize what types of emails you receive from Only4kiddos
          </Text>
          
          <View style={styles.preferencesList}>
            {preferences.map((preference) => (
              <View key={preference.id} style={styles.preferenceItem}>
                <View style={styles.preferenceContent}>
                  <View style={styles.preferenceIcon}>
                    {preference.icon}
                  </View>
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>{preference.title}</Text>
                    <Text style={styles.preferenceDescription}>
                      {preference.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preference.enabled}
                  onValueChange={() => togglePreference(preference.id)}
                  trackColor={{ 
                    false: Colors.border, 
                    true: Colors.primary + '40' 
                  }}
                  thumbColor={preference.enabled ? Colors.primary : Colors.textTertiary}
                  ios_backgroundColor={Colors.border}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Newsletter</Text>
          <NewsletterSubscription
            title="Premium Family Benefits"
            description="Exclusive event previews, special discounts, and premium family content"
            subscriptionType="premium_member"
            showTitle={false}
            compact={true}
            onSuccess={(email) => {
              console.log('Premium subscription successful:', email);
            }}
            onError={(error) => {
              console.log('Premium subscription error:', error);
            }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <BrandedButton
            title="Save Preferences"
            onPress={handleSavePreferences}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandBackground,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.brandSurface,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.base,
  },
  section: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.sm,
  },
  preferencesList: {
    gap: Spacing.lg,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.brandSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    marginRight: Spacing.md,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  preferenceDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.sm,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
});