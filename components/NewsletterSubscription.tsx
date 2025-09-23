import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Mail, Send, CheckCircle } from 'lucide-react-native';
import { BrandedButton } from './BrandedButton';
import { getMailerLiteService } from '@/services/mailerlite';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface NewsletterSubscriptionProps {
  title?: string;
  description?: string;
  subscriptionType?: 'family_events' | 'category_updates' | 'premium_member';
  category?: string;
  showTitle?: boolean;
  compact?: boolean;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export function NewsletterSubscription({
  title = "Stay Updated!",
  description = "Get the latest family-friendly events delivered to your inbox",
  subscriptionType = 'family_events',
  category,
  showTitle = true,
  compact = false,
  onSuccess,
  onError
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const mailerLite = getMailerLiteService();
      let result;

      switch (subscriptionType) {
        case 'category_updates':
          if (!category) {
            Alert.alert('Error', 'Category not specified');
            setLoading(false);
            return;
          }
          result = await mailerLite.subscribeToCategory(email, category, name || undefined);
          break;
        case 'premium_member':
          result = await mailerLite.subscribeToPremiumUpdates(email, name || undefined);
          break;
        default:
          result = await mailerLite.subscribeToEventUpdates(email, name || undefined);
      }

      if (result.error) {
        Alert.alert(
          'Subscription Failed',
          result.message || 'Unable to subscribe at this time. Please try again.',
          [{ text: 'OK' }]
        );
        onError?.(result.error);
      } else {
        setSubscribed(true);
        Alert.alert(
          'Success!',
          'Thank you for subscribing! You\'ll receive amazing family event updates.',
          [{ text: 'Great!' }]
        );
        onSuccess?.(email);
        
        // Reset form after successful subscription
        setTimeout(() => {
          setEmail('');
          setName('');
          setSubscribed(false);
        }, 3000);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to process subscription. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      onError?.('Service unavailable');
    }

    setLoading(false);
  };

  if (subscribed) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.successContainer}>
          <CheckCircle size={24} color={Colors.success} />
          <Text style={styles.successText}>Successfully subscribed!</Text>
          <Text style={styles.successSubtext}>Check your inbox for confirmation</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {showTitle && (
        <View style={styles.header}>
          <Mail size={20} color={Colors.primary} style={styles.mailIcon} />
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      
      {!compact && (
        <Text style={styles.description}>{description}</Text>
      )}

      <View style={styles.form}>
        {!compact && (
          <TextInput
            style={styles.nameInput}
            placeholder="Your name (optional)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor={Colors.textTertiary}
          />
        )}
        
        <TextInput
          style={styles.emailInput}
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={Colors.textTertiary}
        />

        <BrandedButton
          title={loading ? "Subscribing..." : "Subscribe"}
          onPress={handleSubscribe}
          disabled={loading || !email.trim()}
          icon={<Send size={16} color={Colors.textOnPrimary} />}
        />
      </View>
      
      <Text style={styles.privacyText}>
        We respect your privacy. Unsubscribe at any time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brandSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  compactContainer: {
    padding: Spacing.md,
    margin: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mailIcon: {
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.sm,
  },
  form: {
    gap: Spacing.md,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  successText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.success,
    marginTop: Spacing.sm,
  },
  successSubtext: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});