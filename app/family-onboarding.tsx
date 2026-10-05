import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Plus, X } from 'lucide-react-native';
import { BrandedButton } from '@/components/BrandedButton';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import {
  useChildren, useCreateChild, useDeleteChild, useFamilyProfile, useSaveFamilyProfile,
} from '@/hooks/use-events-laravel';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

const STEPS = ['Your kids', 'Your family', 'What you love'] as const;
const AVATAR_COLORS = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

/**
 * Stage 2 of family signup: a short guided stepper parents land on right
 * after creating their account (and can return to from the home screen's
 * "Complete your family profile" card). Each step saves as they go;
 * finishing marks the profile complete on the server.
 */
export default function FamilyOnboardingScreen() {
  const profile = useFamilyProfile();
  const children = useChildren();
  const createChild = useCreateChild();
  const deleteChild = useDeleteChild();
  const saveProfile = useSaveFamilyProfile();

  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [schoolType, setSchoolType] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [prefilled, setPrefilled] = useState(false);

  // Pre-fill once from whatever the server already has.
  useEffect(() => {
    if (prefilled || !profile.data) return;
    setSchoolType(profile.data.schoolType);
    setCity(profile.data.city ?? '');
    setState(profile.data.state ?? '');
    setInterests(profile.data.interests);
    setPrefilled(true);
  }, [profile.data, prefilled]);

  // Every hook above this line — no early returns before here.
  if (profile.isLoading && !profile.data) {
    return <LoadingState label="Getting things ready..." />;
  }
  if (profile.isError || !profile.data) {
    // This screen has no header or swipe-back, so always offer a way out.
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ErrorState message="We couldn't load your profile. Please check your connection." onRetry={profile.refetch} />
        <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)} style={styles.skip} accessibilityRole="button">
          <Text style={styles.skipText}><Text style={styles.skipLink}>Skip for now</Text> — you can finish this later.</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const options = profile.data.options;
  const busy = saveProfile.isPending || createChild.isPending;

  const addChild = async (): Promise<boolean> => {
    const name = childName.trim();
    const age = Number(childAge);
    if (!name) {
      Alert.alert('Name needed', "Add your child's name (a nickname is fine).");
      return false;
    }
    if (childAge.trim() === '' || !Number.isInteger(age) || age < 0 || age > 18) {
      Alert.alert('Check the age', 'Enter an age from 0 to 18.');
      return false;
    }
    try {
      await createChild.mutateAsync({
        name,
        age,
        avatarColor: AVATAR_COLORS[children.data.length % AVATAR_COLORS.length],
      });
      setChildName('');
      setChildAge('');
      return true;
    } catch {
      Alert.alert('Something went wrong', "We couldn't add that child. Please try again.");
      return false;
    }
  };

  const removeChild = (id: string, name: string) => {
    Alert.alert('Remove child?', `Remove ${name} from your family profile?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { deleteChild.mutateAsync({ id }).catch(() => {}); } },
    ]);
  };

  const toggleInterest = (value: string) => {
    setInterests((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );
  };

  const next = async () => {
    try {
      if (step === 0) {
        // A typed-but-not-added child is almost always meant to be added.
        if ((childName.trim() || childAge.trim()) && !(await addChild())) return;
      }
      if (step === 1) {
        await saveProfile.mutateAsync({ schoolType, city: city.trim() || null, state: state.trim() || null });
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch {
      Alert.alert('Something went wrong', "We couldn't save that. Please try again.");
    }
  };

  const finish = async () => {
    try {
      await saveProfile.mutateAsync({ interests, complete: true });
      router.replace('/(tabs)' as any);
    } catch {
      Alert.alert('Something went wrong', "We couldn't save your profile. Please try again.");
    }
  };

  const skip = () => router.replace('/(tabs)' as any);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {profile.data.name ? `Welcome, ${profile.data.name.split(' ')[0]}!` : 'Welcome!'} 🎉
          </Text>
          <Text style={styles.subtitle}>Three quick questions so we can show you events your kids will love.</Text>

          {/* Stepper */}
          <View style={styles.stepper} accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((label, i) => (
              <View key={label} style={styles.stepItem}>
                <View style={[styles.stepDot, i < step && styles.stepDotDone, i === step && styles.stepDotCurrent]}>
                  {i < step
                    ? <Check size={16} color={Colors.textOnPrimary} />
                    : <Text style={[styles.stepNum, i === step && styles.stepNumCurrent]}>{i + 1}</Text>}
                </View>
                <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${profile.data.completion}%` }]} />
          </View>
          <Text style={styles.barText}>Profile {profile.data.completion}% complete</Text>

          <View style={styles.card}>
            <Text style={styles.stepEyebrow}>STEP {step + 1} OF {STEPS.length}</Text>

            {step === 0 && (
              <>
                <Text style={styles.question}>Who are your kids?</Text>
                <Text style={styles.hint}>We match events to their ages. Add one child at a time.</Text>

                <View style={styles.chips}>
                  {children.data.length === 0 && <Text style={styles.empty}>No kids added yet</Text>}
                  {children.data.map((c) => (
                    <View key={c.id} style={styles.kidChip}>
                      <Text style={styles.kidChipText}>{c.name} · {c.age === 0 ? 'under 1' : `${c.age}`}</Text>
                      <TouchableOpacity
                        onPress={() => removeChild(c.id, c.name)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${c.name}`}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={14} color={Colors.primaryDark} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={styles.addRow}>
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="Name"
                    value={childName}
                    onChangeText={setChildName}
                    maxLength={50}
                    autoCapitalize="words"
                    placeholderTextColor={Colors.textTertiary}
                  />
                  <TextInput
                    style={[styles.input, styles.ageInput]}
                    placeholder="Age"
                    value={childAge}
                    onChangeText={(t) => setChildAge(t.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textTertiary}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addChild}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel="Add child"
                  >
                    <Plus size={20} color={Colors.textOnPrimary} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 1 && (
              <>
                <Text style={styles.question}>How do you school your kids?</Text>
                <Text style={styles.hint}>This helps us tailor the events and resources we share with you.</Text>
                <View style={styles.optionGrid}>
                  {options.schoolTypes.map((o) => {
                    const selected = schoolType === o.value;
                    return (
                      <TouchableOpacity
                        key={o.value}
                        style={[styles.option, selected && styles.optionSelected]}
                        onPress={() => setSchoolType(selected ? null : o.value)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{o.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.question, styles.questionSpaced]}>Where are you?</Text>
                <Text style={styles.hint}>So we can show events near you.</Text>
                <View style={styles.addRow}>
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                    autoCapitalize="words"
                    textContentType="addressCity"
                    placeholderTextColor={Colors.textTertiary}
                  />
                  <TextInput
                    style={[styles.input, styles.stateInput]}
                    placeholder="State"
                    value={state}
                    onChangeText={setState}
                    autoCapitalize="characters"
                    maxLength={20}
                    textContentType="addressState"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.question}>What does your family love?</Text>
                <Text style={styles.hint}>Pick as many as you like.</Text>
                <View style={styles.chips}>
                  {options.interests.map((o) => {
                    const selected = interests.includes(o.value);
                    return (
                      <TouchableOpacity
                        key={o.value}
                        style={[styles.interest, selected && styles.interestSelected]}
                        onPress={() => toggleInterest(o.value)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                      >
                        <Text style={[styles.interestText, selected && styles.interestTextSelected]}>{o.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.nav}>
              {step > 0 ? (
                <TouchableOpacity onPress={() => setStep((s) => s - 1)} disabled={busy} accessibilityRole="button">
                  <Text style={styles.back}>← Back</Text>
                </TouchableOpacity>
              ) : <View />}
              <BrandedButton
                title={step < STEPS.length - 1 ? (busy ? 'Saving…' : 'Next →') : (busy ? 'Saving…' : 'Finish 🎈')}
                onPress={step < STEPS.length - 1 ? next : finish}
                disabled={busy}
                size="medium"
              />
            </View>
          </View>

          <TouchableOpacity onPress={skip} style={styles.skip} accessibilityRole="button">
            <Text style={styles.skipText}>
              <Text style={styles.skipLink}>Skip for now</Text> — you can finish this anytime from the home screen.
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brandBackground },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  title: {
    fontSize: Typography.fontSizes['2xl'], fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary, textAlign: 'center', marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, textAlign: 'center',
    marginTop: Spacing.sm, marginBottom: Spacing.xl,
  },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  stepItem: { flex: 1, alignItems: 'center' },
  stepDot: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  stepDotCurrent: { borderColor: Colors.primary },
  stepDotDone: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  stepNum: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.bold, color: Colors.textTertiary },
  stepNumCurrent: { color: Colors.primary },
  stepLabel: { marginTop: Spacing.xs, fontSize: Typography.fontSizes.xs, color: Colors.textTertiary },
  stepLabelActive: { color: Colors.primaryDark, fontWeight: Typography.fontWeights.semibold },
  barTrack: { height: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.border, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.full },
  barText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, textAlign: 'right', marginTop: Spacing.xs },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginTop: Spacing.lg,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  stepEyebrow: {
    fontSize: Typography.fontSizes.xs, fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary, letterSpacing: 1,
  },
  question: {
    fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary, marginTop: Spacing.xs,
  },
  questionSpaced: { marginTop: Spacing.xl },
  hint: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  empty: { fontSize: Typography.fontSizes.sm, color: Colors.textTertiary, paddingVertical: Spacing.xs },
  kidChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.brandSurface,
    borderWidth: 1, borderColor: Colors.primaryLight, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md,
  },
  kidChipText: { fontSize: Typography.fontSizes.sm, fontWeight: Typography.fontWeights.medium, color: Colors.primaryDark },
  addRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: Typography.fontSizes.base, color: Colors.textPrimary,
  },
  nameInput: { flex: 1, minWidth: 0 },
  ageInput: { width: 72 },
  stateInput: { width: 96 },
  addButton: {
    width: 46, height: 46, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  option: {
    flexBasis: '48%', flexGrow: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, backgroundColor: Colors.surface,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.brandSurface },
  optionText: { fontSize: Typography.fontSizes.sm, color: Colors.textPrimary },
  optionTextSelected: { color: Colors.primaryDark, fontWeight: Typography.fontWeights.semibold },
  interest: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: Colors.surface,
  },
  interestSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  interestText: { fontSize: Typography.fontSizes.sm, color: Colors.textPrimary },
  interestTextSelected: { color: Colors.textOnPrimary, fontWeight: Typography.fontWeights.semibold },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xl },
  back: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, fontWeight: Typography.fontWeights.medium },
  skip: { marginTop: Spacing.xl, marginBottom: Spacing.xl, alignItems: 'center' },
  skipText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
  skipLink: { textDecorationLine: 'underline', color: Colors.textPrimary },
});
