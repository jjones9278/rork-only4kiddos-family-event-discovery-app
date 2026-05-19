import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { BrandedSpinner } from '@/components/BrandedSpinner';
import { BrandedModal } from '@/components/BrandedModal';
import { BrandedInput, BrandedDropdown } from '@/components/BrandedFormComponents';
import { BrandedButton } from '@/components/BrandedButton';
import { BrandedPatternBackground } from '@/components/BrandedPatternBackground';
import { BrandedSplashScreen } from '@/components/BrandedSplashScreen';
import { Colors, Typography, Spacing } from '@/constants/colors';
import { Heart, Star, Send } from 'lucide-react-native';

export default function BrandingDemoScreen() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const dropdownOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  if (showSplash) {
    return (
      <BrandedSplashScreen
        onAnimationComplete={() => setShowSplash(false)}
        showDecorations={true}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BrandedPatternBackground pattern="mixed" opacity={0.05}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>4kiddos Branding Demo</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loading Spinners</Text>
            <View style={styles.spinnerRow}>
              <BrandedSpinner variant="pinwheel" size="small" showTagline={false} />
              <BrandedSpinner variant="balloon" size="medium" showTagline={false} />
              <BrandedSpinner variant="kids" size="large" showTagline={false} />
            </View>
            {loading && (
              <BrandedSpinner 
                variant="pinwheel" 
                size="medium" 
                showTagline={true}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enhanced Buttons</Text>
            <BrandedButton
              title="Primary with Glow"
              onPress={() => setShowModal(true)}
              variant="primary"
              icon={<Heart size={16} color={Colors.textOnPrimary} />}
              enableGlow={true}
              enableRipple={true}
              enableBounce={true}
            />
            <BrandedButton
              title="Secondary Bounce"
              onPress={handleLoadingDemo}
              variant="secondary"
              icon={<Star size={16} color={Colors.textOnPrimary} />}
              enableBounce={true}
              enableRipple={false}
            />
            <BrandedButton
              title="Outline Ripple"
              onPress={() => setShowSplash(true)}
              variant="outline"
              icon={<Send size={16} color={Colors.primary} />}
              enableRipple={true}
              enableGlow={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Form Components</Text>
            <BrandedInput
              label="Event Name"
              placeholder="Enter event name..."
              value={inputValue}
              onChangeText={setInputValue}
            />
            <BrandedDropdown
              label="Event Category"
              placeholder="Select category..."
              value={dropdownValue}
              options={dropdownOptions}
              onSelect={setDropdownValue}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pattern Backgrounds</Text>
            <Text style={styles.description}>
              This entire screen uses a mixed pattern background with stars, kites, puzzles, and crayons.
            </Text>
          </View>
        </ScrollView>
      </BrandedPatternBackground>

      <BrandedModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Welcome to 4kiddos!"
        confirmText="Get Started"
        cancelText="Maybe Later"
        onConfirm={() => console.log('Confirmed')}
        variant="default"
      >
        <Text style={styles.modalText}>
          Discover amazing family events and activities in your area. 
          Our curated selection makes it easy to find the perfect experience for your kids!
        </Text>
      </BrandedModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
  },
  section: {
    marginBottom: Spacing['3xl'],
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  spinnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.base,
  },
  modalText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.base,
    textAlign: 'center',
  },
});