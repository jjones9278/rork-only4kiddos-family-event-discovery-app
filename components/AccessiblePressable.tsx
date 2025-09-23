import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';

type Props = PressableProps & { minSize?: number };
export default function AccessiblePressable({ minSize = 44, style, ...rest }: Props) {
  const baseStyle: ViewStyle = { 
    minWidth: minSize, 
    minHeight: minSize, 
    justifyContent: 'center', 
    alignItems: 'center' 
  };
  
  return (
    <Pressable
      hitSlop={8}
      style={typeof style === 'function' ? (state) => [baseStyle, style(state)] : [baseStyle, style]}
      {...rest}
    />
  );
}