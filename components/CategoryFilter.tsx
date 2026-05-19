import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trees, Home, GraduationCap, Trophy, Palette, Music, PartyPopper, Wrench, Users } from 'lucide-react-native';
import { categories } from '@/mocks/categories';
import { EventCategory } from '@/types/event';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

interface CategoryFilterProps {
  selectedCategories: EventCategory[];
  onCategoryToggle: (category: EventCategory) => void;
}

export function CategoryFilter({ selectedCategories, onCategoryToggle }: CategoryFilterProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const iconMap: Record<string, React.ComponentType<any>> = {
          Trees,
          Home,
          GraduationCap,
          Trophy,
          Palette,
          Music,
          PartyPopper,
          Wrench,
          Users,
        };
        
        const IconComponent = iconMap[category.icon];
        const isSelected = selectedCategories.includes(category.id);
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              isSelected && { backgroundColor: Colors.primary }
            ]}
            onPress={() => onCategoryToggle(category.id)}
            activeOpacity={0.7}
          >
            {IconComponent && (
              <IconComponent 
                size={16} 
                color={isSelected ? Colors.textOnPrimary : Colors.primary}
              />
            )}
            <Text style={[
              styles.chipText,
              isSelected && styles.chipTextSelected
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.surfaceSecondary,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.textOnPrimary,
  },
});