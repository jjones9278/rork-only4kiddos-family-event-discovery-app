import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/colors';

interface BrandedPatternBackgroundProps {
  pattern?: 'stars' | 'kites' | 'puzzles' | 'crayons' | 'mixed';
  opacity?: number;
  children?: React.ReactNode;
  style?: any;
}

export function BrandedPatternBackground({
  pattern = 'mixed',
  opacity = 0.1,
  children,
  style
}: BrandedPatternBackgroundProps) {
  const { width, height } = Dimensions.get('window');
  
  const getPatternElements = () => {
    const elements = [];
    const spacing = 60;
    const cols = Math.ceil(width / spacing);
    const rows = Math.ceil(height / spacing);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + (row % 2) * (spacing / 2);
        const y = row * spacing;
        
        let shape;
        let color;
        
        if (pattern === 'mixed') {
          const shapes = ['⭐', '🪁', '🧩', '🖍️'];
          const colors = [Colors.brandTeal, Colors.accent, Colors.accentPink, Colors.accentPurple];
          shape = shapes[(row + col) % shapes.length];
          color = colors[(row + col) % colors.length];
        } else {
          switch (pattern) {
            case 'stars':
              shape = '⭐';
              color = Colors.brandTeal;
              break;
            case 'kites':
              shape = '🪁';
              color = Colors.accent;
              break;
            case 'puzzles':
              shape = '🧩';
              color = Colors.accentPink;
              break;
            case 'crayons':
              shape = '🖍️';
              color = Colors.accentPurple;
              break;
            default:
              shape = '⭐';
              color = Colors.brandTeal;
          }
        }
        
        elements.push(
          <View
            key={`${row}-${col}`}
            style={[
              styles.patternElement,
              {
                left: x,
                top: y,
                opacity,
              }
            ]}
          >
            <PatternShape shape={shape} color={color} />
          </View>
        );
      }
    }
    
    return elements;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.patternContainer}>
        {getPatternElements()}
      </View>
      {children && (
        <View style={styles.contentContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

interface PatternShapeProps {
  shape: string;
  color: string;
}

function PatternShape({ shape, color }: PatternShapeProps) {
  if (shape === '⭐') {
    return <StarShape color={color} />;
  }
  
  if (shape === '🪁') {
    return <KiteShape color={color} />;
  }
  
  if (shape === '🧩') {
    return <PuzzleShape color={color} />;
  }
  
  if (shape === '🖍️') {
    return <CrayonShape color={color} />;
  }
  
  return <StarShape color={color} />;
}

function StarShape({ color }: { color: string }) {
  return (
    <View style={styles.starContainer}>
      <View style={[styles.starPoint, { backgroundColor: color }]} />
      <View style={[styles.starPoint, styles.starPointRotated, { backgroundColor: color }]} />
    </View>
  );
}

function KiteShape({ color }: { color: string }) {
  return (
    <View style={styles.kiteContainer}>
      <View style={[styles.kiteBody, { backgroundColor: color }]} />
      <View style={[styles.kiteTail, { backgroundColor: color }]} />
    </View>
  );
}

function PuzzleShape({ color }: { color: string }) {
  return (
    <View style={[styles.puzzlePiece, { backgroundColor: color }]}>
      <View style={[styles.puzzleKnob, { backgroundColor: color }]} />
    </View>
  );
}

function CrayonShape({ color }: { color: string }) {
  return (
    <View style={styles.crayonContainer}>
      <View style={[styles.crayonTip, { borderBottomColor: color }]} />
      <View style={[styles.crayonBody, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  patternElement: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  
  // Star shape
  starContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starPoint: {
    position: 'absolute',
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  starPointRotated: {
    transform: [{ rotate: '45deg' }],
  },
  
  // Kite shape
  kiteContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
  },
  kiteBody: {
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  kiteTail: {
    width: 1,
    height: 8,
    marginTop: -2,
  },
  
  // Puzzle piece
  puzzlePiece: {
    width: 16,
    height: 16,
    borderRadius: 3,
    position: 'relative',
  },
  puzzleKnob: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: -3,
    right: 5,
  },
  
  // Crayon shape
  crayonContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
  },
  crayonTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  crayonBody: {
    width: 6,
    height: 12,
    borderRadius: 1,
  },
});