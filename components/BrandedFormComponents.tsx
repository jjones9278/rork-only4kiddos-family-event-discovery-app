import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, AnimationDurations } from '@/constants/colors';

interface BrandedInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  error?: string;
  style?: any;
}

export function BrandedInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
  style
}: BrandedInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const focusAnimation = new Animated.Value(0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: AnimationDurations.fast,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: AnimationDurations.fast,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.brandTeal],
  });

  const glowOpacity = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <Animated.View
          style={[
            styles.inputContainer,
            { borderColor },
            error && styles.errorBorder,
          ]}
        >
          <TextInput
            style={[
              styles.input,
              multiline && styles.multilineInput,
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textTertiary}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
          />
        </Animated.View>
        {isFocused && (
          <Animated.View
            style={[
              styles.focusGlow,
              { opacity: glowOpacity },
            ]}
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface BrandedDropdownProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  error?: string;
  style?: any;
}

export function BrandedDropdown({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  style
}: BrandedDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    if (!optionValue || optionValue.trim().length === 0) return;
    onSelect(optionValue);
    setIsOpen(false);
    setIsFocused(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setIsFocused(!isOpen);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.dropdownContainer,
          isFocused && styles.focusedDropdown,
          error && styles.errorBorder,
        ]}
        onPress={toggleDropdown}
      >
        <Text style={[
          styles.dropdownText,
          !selectedOption && styles.placeholderText
        ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <View style={styles.dropdownIcon}>
          <ChevronDown 
            size={20} 
            color={Colors.textSecondary}
            style={isOpen ? styles.rotatedIcon : undefined}
          />
        </View>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                option.value === value && styles.selectedOption
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <Text style={[
                styles.optionText,
                option.value === value && styles.selectedOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.regular,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  focusGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.accent,
    zIndex: -1,
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  
  // Dropdown styles
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  focusedDropdown: {
    borderColor: Colors.brandTeal,
    shadowColor: Colors.brandTeal,
    shadowOpacity: 0.2,
  },
  dropdownText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.regular,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  dropdownIcon: {
    marginLeft: Spacing.sm,
  },
  rotatedIcon: {
    transform: [{ rotate: '180deg' }],
  },
  optionsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  selectedOption: {
    backgroundColor: Colors.brandTealLight,
  },
  optionText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.regular,
  },
  selectedOptionText: {
    color: Colors.brandTealDark,
    fontWeight: Typography.fontWeights.semibold,
  },
});