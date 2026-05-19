import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, AnimationDurations } from '@/constants/colors';

interface BrandedSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  variant?: 'pinwheel' | 'balloon' | 'kids';
  style?: any;
}

export function BrandedSpinner({ 
  size = 'medium', 
  showTagline = true, 
  variant = 'pinwheel',
  style 
}: BrandedSpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const sizeConfig = {
    small: { spinner: 24, container: 60 },
    medium: { spinner: 40, container: 80 },
    large: { spinner: 60, container: 120 },
  };

  const currentSize = sizeConfig[size];

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: AnimationDurations.bounce || 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: AnimationDurations.bounce || 800,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    if (variant === 'kids') {
      bounceAnimation.start();
    } else if (variant === 'balloon') {
      scaleAnimation.start();
    }

    return () => {
      spinAnimation.stop();
      bounceAnimation.stop();
      scaleAnimation.stop();
    };
  }, [spinValue, bounceValue, scaleValue, variant]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const renderSpinner = () => {
    const baseSpinnerStyle = [
      styles.spinner,
      {
        width: currentSize.spinner,
        height: currentSize.spinner,
        transform: [{ rotate: spin }],
      },
    ];

    if (variant === 'pinwheel') {
      return (
        <Animated.View style={baseSpinnerStyle}>
          <View style={[styles.pinwheelBlade, styles.blade1]} />
          <View style={[styles.pinwheelBlade, styles.blade2]} />
          <View style={[styles.pinwheelBlade, styles.blade3]} />
          <View style={[styles.pinwheelBlade, styles.blade4]} />
          <View style={styles.pinwheelCenter} />
        </Animated.View>
      );
    }

    if (variant === 'balloon') {
      return (
        <Animated.View 
          style={[
            baseSpinnerStyle,
            { transform: [{ rotate: spin }, { scale: scaleValue }] }
          ]}
        >
          <View style={styles.balloon} />
          <View style={styles.balloonString} />
        </Animated.View>
      );
    }

    if (variant === 'kids') {
      return (
        <Animated.View 
          style={[
            styles.kidsContainer,
            {
              width: currentSize.spinner,
              height: currentSize.spinner,
              transform: [{ translateY: bounce }],
            }
          ]}
        >
          <View style={styles.kidSilhouette1} />
          <View style={styles.kidSilhouette2} />
          <View style={styles.kidSilhouette3} />
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { height: currentSize.container }, style]}>
      {renderSpinner()}
      {showTagline && (
        <Text style={styles.tagline}>
          Discover Fun, Book Easily, Play Happily.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Pinwheel styles
  pinwheelBlade: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  blade1: {
    top: -8,
    left: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.brandTeal,
  },
  blade2: {
    top: 0,
    right: -8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.accent,
  },
  blade3: {
    bottom: -8,
    right: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.accentPink,
  },
  blade4: {
    top: 0,
    left: -8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.accentPurple,
  },
  pinwheelCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  
  // Balloon styles
  balloon: {
    width: 24,
    height: 32,
    backgroundColor: Colors.brandTeal,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  balloonString: {
    width: 1,
    height: 16,
    backgroundColor: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Kids silhouettes styles
  kidsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  kidSilhouette1: {
    width: 8,
    height: 16,
    backgroundColor: Colors.brandTeal,
    borderRadius: 4,
  },
  kidSilhouette2: {
    width: 6,
    height: 12,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  kidSilhouette3: {
    width: 7,
    height: 14,
    backgroundColor: Colors.accentPink,
    borderRadius: 3.5,
  },
  
  tagline: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    letterSpacing: 0.3,
  },
});