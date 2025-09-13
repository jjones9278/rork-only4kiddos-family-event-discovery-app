import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogo } from './BrandLogo';
import { AnimationDurations } from '@/constants/colors';

interface BrandedSplashScreenProps {
  onAnimationComplete?: () => void;
  showDecorations?: boolean;
}

export function BrandedSplashScreen({ 
  onAnimationComplete,
  showDecorations = true 
}: BrandedSplashScreenProps) {
  const bounceValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const decorationValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const logoAnimation = Animated.sequence([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: AnimationDurations.slow || 500,
        useNativeDriver: true,
      }),
      Animated.spring(bounceValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    const decorationAnimation = Animated.stagger(200, 
      decorationValues.map((value) => 
        Animated.timing(value, {
          toValue: 1,
          duration: AnimationDurations.bounce || 800,
          useNativeDriver: true,
        })
      )
    );

    const completeAnimation = Animated.parallel([
      logoAnimation,
      decorationAnimation,
    ]);

    completeAnimation.start(() => {
      timeoutId = setTimeout(() => {
        onAnimationComplete?.();
      }, 1000);
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [bounceValue, fadeValue, decorationValues, onAnimationComplete]);

  const logoScale = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const renderDecorations = () => {
    if (!showDecorations) return null;

    const decorations = [
      { icon: '⭐', top: height * 0.15, left: width * 0.1, animIndex: 0 },
      { icon: '🎈', top: height * 0.2, right: width * 0.15, animIndex: 1 },
      { icon: '🧩', bottom: height * 0.25, left: width * 0.12, animIndex: 2 },
      { icon: '✨', bottom: height * 0.15, right: width * 0.1, animIndex: 3 },
    ];

    return decorations.map((decoration) => {
      const animatedValue = decorationValues[decoration.animIndex];
      if (!animatedValue) return null;
      
      const scale = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      });
      const rotate = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

      return (
        <Animated.Text
          key={`decoration-${decoration.animIndex}`}
          style={[
            styles.decoration,
            {
              position: 'absolute',
              top: decoration.top,
              left: decoration.left,
              right: decoration.right,
              bottom: decoration.bottom,
              transform: [{ scale }, { rotate }],
            },
          ]}
        >
          {decoration.icon}
        </Animated.Text>
      );
    }).filter(Boolean);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#01fee7', '#FFE66D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {renderDecorations()}
        
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeValue,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <BrandLogo 
            size="large" 
            showTagline={true}
            variant="full"
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  decoration: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});