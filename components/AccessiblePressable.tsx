import React from 'react';
import { Pressable, PressableProps } from 'react-native';

type Props = PressableProps & { minSize?: number };
export default function AccessiblePressable({ minSize = 44, style, ...rest }: Props) {
  return (
    <Pressable
      hitSlop={8}
      style={[{ minWidth: minSize, minHeight: minSize, justifyContent: 'center', alignItems: 'center' }, style]}
      {...rest}
    />
  );
}