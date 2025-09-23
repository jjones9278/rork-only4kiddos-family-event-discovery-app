import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { X, DollarSign } from 'lucide-react-native';
import { EventCategory } from '@/types/event';
import { categories } from '@/mocks/categories';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

export default function FiltersScreen() {
  // Filters are now handled in parent components
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [ageRange, setAgeRange] = useState({ min: 0, max: 18 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

  const handleApply = () => {
    // Note: Filters are now managed per component
    // This screen could be enhanced to pass filters back to parent
    router.back();
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setAgeRange({ min: 0, max: 18 });
    setPriceRange({ min: 0, max: 100 });
  };

  const toggleCategory = (category: EventCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category.id) && { backgroundColor: category.color }
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategories.includes(category.id) && styles.categoryChipTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <View style={styles.rangeContainer}>
            <Text style={styles.rangeLabel}>{ageRange.min} - {ageRange.max} years</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Min Age</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={18}
                value={ageRange.min}
                onValueChange={(value) => setAgeRange({ ...ageRange, min: Math.round(value) })}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#7C3AED"
              />
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Max Age</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={18}
                value={ageRange.max}
                onValueChange={(value) => setAgeRange({ ...ageRange, max: Math.round(value) })}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#7C3AED"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.rangeContainer}>
            <View style={styles.priceDisplay}>
              <DollarSign size={18} color="#6B7280" />
              <Text style={styles.rangeLabel}>
                {priceRange.min === 0 ? 'Free' : `$${priceRange.min}`} - ${priceRange.max}
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Max Price</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={priceRange.max}
                onValueChange={(value) => setPriceRange({ ...priceRange, max: Math.round(value) })}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#7C3AED"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  rangeContainer: {
    gap: 16,
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sliderContainer: {
    gap: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});