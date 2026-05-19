import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, AnimationDurations } from '@/constants/colors';

interface BrandedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: any;
  enableRipple?: boolean;
  enableGlow?: boolean;
  enableBounce?: boolean;
}

export function BrandedButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  icon,
  style,
  enableRipple = true,
  enableGlow = true,
  enableBounce = true
}: BrandedButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const rippleValue = useRef(new Animated.Value(0)).current;
  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button];
    
    // Add size style
    if (size === 'small') baseStyle.push(styles.smallButton);
    else if (size === 'large') baseStyle.push(styles.largeButton);
    else baseStyle.push(styles.mediumButton);
    
    // Add variant style
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineButton);
    } else {
      baseStyle.push(styles.primaryButton);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any[] = [styles.text];
    
    // Add size style
    if (size === 'small') baseStyle.push(styles.smallText);
    else if (size === 'large') baseStyle.push(styles.largeText);
    else baseStyle.push(styles.mediumText);
    
    // Add variant style
    if (disabled) {
      baseStyle.push(styles.disabledText);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    } else {
      baseStyle.push(styles.primaryText);
    }
    
    return baseStyle;
  };

  const getGlowStyle = () => {
    if (variant === 'secondary') {
      return { backgroundColor: Colors.secondary };
    } else if (variant === 'outline') {
      return { backgroundColor: Colors.primary };
    }
    return { backgroundColor: Colors.primary };
  };

  const getRippleColor = () => {
    if (variant === 'outline') {
      return { backgroundColor: Colors.primary };
    }
    return { backgroundColor: Colors.textOnPrimary };
  };

  const handlePressIn = () => {
    if (disabled) return;
    
    const animations = [];
    
    if (enableBounce) {
      animations.push(
        Animated.spring(scaleValue, {
          toValue: 0.95,
          useNativeDriver: true,
        })
      );
    }
    
    if (enableGlow && Platform.OS !== 'web') {
      animations.push(
        Animated.timing(glowValue, {
          toValue: 1,
          duration: AnimationDurations.fast,
          useNativeDriver: true,
        })
      );
    }
    
    if (enableRipple) {
      rippleValue.setValue(0);
      animations.push(
        Animated.timing(rippleValue, {
          toValue: 1,
          duration: AnimationDurations.normal,
          useNativeDriver: true,
        })
      );
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    const animations = [];
    
    if (enableBounce) {
      animations.push(
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        })
      );
    }
    
    if (enableGlow && Platform.OS !== 'web') {
      animations.push(
        Animated.timing(glowValue, {
          toValue: 0,
          duration: AnimationDurations.normal,
          useNativeDriver: true,
        })
      );
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  };

  const rippleScale = rippleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const rippleOpacity = rippleValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.1, 0],
  });

  return (
    <View style={[styles.buttonWrapper, style]}>
      {enableGlow && Platform.OS !== 'web' && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowValue,
              transform: [{ scale: scaleValue }],
            },
            getGlowStyle(),
          ]}
        />
      )}
      
      <Animated.View
        style={[styles.animatedContainer, { transform: [{ scale: scaleValue }] }]}
      >
        <TouchableOpacity 
          style={getButtonStyle()}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
        >
          {enableRipple && (
            <Animated.View
              style={[
                styles.rippleEffect,
                {
                  opacity: rippleOpacity,
                  transform: [{ scale: rippleScale }],
                },
                getRippleColor(),
              ]}
            />
          )}
          
          <View style={styles.content}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    position: 'relative',
  },
  button: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: BorderRadius.xl + 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  rippleEffect: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
  },
  animatedContainer: {
    // Container for animated scaling
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  
  // Size variants
  smallButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  mediumButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  largeButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  
  // Color variants
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.shadow,
  },
  disabledButton: {
    backgroundColor: Colors.surfaceSecondary,
    shadowColor: 'transparent',
  },
  
  // Text styles
  text: {
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: Typography.fontSizes.sm,
  },
  mediumText: {
    fontSize: Typography.fontSizes.base,
  },
  largeText: {
    fontSize: Typography.fontSizes.lg,
  },
  
  // Text color variants
  primaryText: {
    color: Colors.textOnPrimary,
  },
  secondaryText: {
    color: Colors.textOnPrimary,
  },
  outlineText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.textTertiary,
  },
});