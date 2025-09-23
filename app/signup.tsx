import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Heart } from 'lucide-react-native';
import { BrandedButton } from '@/components/BrandedButton';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter a password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords Don\'t Match', 'Please make sure both passwords are the same');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      Alert.alert(
        'Welcome to Only4kiddos!', 
        'Your family account has been created successfully. Let\'s start discovering amazing events!',
        [{ text: 'Let\'s Go!', onPress: () => router.replace('/(tabs)' as any) }]
      );
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login' as any);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BrandLogo size="large" showTagline={true} />
          <Text style={styles.welcomeText}>Join Our Family!</Text>
          <Text style={styles.subtitle}>Create your account to discover and book amazing family events</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={Colors.textTertiary}
            />
            <BrandedButton
              title=""
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              icon={showPassword ? 
                <EyeOff size={20} color={Colors.textSecondary} /> : 
                <Eye size={20} color={Colors.textSecondary} />
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={Colors.textTertiary}
            />
            <BrandedButton
              title=""
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
              icon={showConfirmPassword ? 
                <EyeOff size={20} color={Colors.textSecondary} /> : 
                <Eye size={20} color={Colors.textSecondary} />
              }
            />
          </View>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Heart size={16} color={Colors.accentPink} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Save your favorite events</Text>
            </View>
            <View style={styles.benefitItem}>
              <Heart size={16} color={Colors.accentPink} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Manage family profiles</Text>
            </View>
            <View style={styles.benefitItem}>
              <Heart size={16} color={Colors.accentPink} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Get personalized recommendations</Text>
            </View>
          </View>

          <BrandedButton
            title={loading ? "Creating Account..." : "Create Family Account"}
            onPress={handleSignup}
            disabled={loading}
            icon={<ArrowRight size={16} color={Colors.textOnPrimary} />}
            style={styles.signupButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Already have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          <BrandedButton
            title="Sign In"
            onPress={navigateToLogin}
            style={styles.loginButton}
          />
        </View>

        <Text style={styles.privacyText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy. 
          We're committed to keeping your family's information safe and secure.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
    paddingTop: Spacing['2xl'],
  },
  welcomeText: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.base,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
  },
  passwordInput: {
    paddingRight: Spacing.sm,
  },
  eyeButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 'auto',
  },
  benefitsContainer: {
    backgroundColor: Colors.brandSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  signupButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textTertiary,
  },
  loginButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  loginButtonText: {
    color: Colors.primary,
  },
  privacyText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.xs,
  },
});