import React from 'react';
import { Image, ImageProps, ImageStyle } from 'react-native';

type Props = ImageProps & { w?: number; h?: number };
export function AppImage({ w, h, style, resizeMode = 'cover', ...rest }: Props) {
  const sizeStyle: ImageStyle | null = w && h ? { width: w, height: h } : null;
  return <Image resizeMode={resizeMode} style={[sizeStyle, style]} {...rest} />;
}