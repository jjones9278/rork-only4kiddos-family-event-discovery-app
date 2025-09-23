import React from 'react';
import { Image, ImageProps } from 'react-native';

type Props = ImageProps & { w?: number; h?: number };
export function AppImage({ w, h, style, resizeMode = 'cover', ...rest }: Props) {
  return <Image resizeMode={resizeMode} style={[w && h ? { width: w, height: h } : null, style]} {...rest} />;
}