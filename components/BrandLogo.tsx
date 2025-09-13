import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Typography } from '@/constants/colors';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  variant?: 'full' | 'icon-only' | 'text-only';
  style?: any;
}

export function BrandLogo({ size = 'medium', showTagline = false, variant = 'full', style }: BrandLogoProps) {
  const sizeStyles = {
    small: { height: 24, width: 80 },
    medium: { height: 32, width: 120 },
    large: { height: 48, width: 180 },
  };

  const iconSizeStyles = {
    small: { height: 24, width: 24 },
    medium: { height: 32, width: 32 },
    large: { height: 48, width: 48 },
  };

  const currentSize = variant === 'icon-only' ? iconSizeStyles[size] : sizeStyles[size];

  const getLogoSource = () => {
    if (variant === 'icon-only') {
      return 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/w2jx39v9hce3yvtrx5cjh';
    }
    if (variant === 'text-only') {
      return 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/c4udsh7iownjb61e20r9s';
    }
    return 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/77mctd1ynh6eq3hiqmxs3';
  };

  return (
    <View style={[styles.container, style]}>
      <Image 
        source={{ uri: getLogoSource() }}
        style={[styles.logo, currentSize]}
        resizeMode="contain"
      />
      {showTagline && (
        <Text style={styles.tagline}>
          Curated family events & activities
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    // Dimensions are set dynamically via currentSize
  },
  tagline: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    marginTop: 8,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
});