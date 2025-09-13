import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Child } from '@/types/event';

interface ChildAvatarProps {
  child: Child;
  size?: number;
  selected?: boolean;
}

export function ChildAvatar({ child, size = 40, selected = false }: ChildAvatarProps) {
  const initial = child?.name?.charAt(0)?.toUpperCase() || '?';
  
  return (
    <View style={[
      styles.container,
      { 
        width: size, 
        height: size, 
        backgroundColor: child.avatarColor,
        borderWidth: selected ? 3 : 0,
      }
    ]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#7C3AED',
  },
  initial: {
    color: '#fff',
    fontWeight: 'bold',
  },
});