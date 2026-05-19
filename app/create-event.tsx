import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { router, Stack } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Calendar, MapPin, DollarSign, Users, X, Sparkles } from 'lucide-react-native';
import { useCreateEvent, useCategories } from '@/hooks/use-events-laravel';
import { BrandLogo } from '@/components/BrandLogo';
import { BrandedButton } from '@/components/BrandedButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/colors';

export default function CreateEventScreen() {
  const createEvent = useCreateEvent();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const navigation = useNavigation();

  const safeGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else router.replace('/(tabs)' as any);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');           // YYYY-MM-DD
  const [startTime, setStartTime] = useState(''); // HH:mm (24h)
  const [endTime, setEndTime] = useState('');     // HH:mm (24h)
  const [venue, setVenue] = useState('');
  const [price, setPrice] = useState('');
  const [ticketName, setTicketName] = useState('General Admission');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!title || !description || !date || !startTime || !endTime || !venue || !maxAttendees || !minAge || !maxAge) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    if (selectedCategoryId == null) {
      Alert.alert('Category Required', 'Please pick a category');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid Date', 'Use YYYY-MM-DD');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      Alert.alert('Invalid Time', 'Use 24-hour HH:mm (e.g. 14:30)');
      return;
    }

    try {
      const obj={
        title,
        description,
        venue,
        start_date: `${date}T${startTime}:00`,
        end_date: `${date}T${endTime}:00`,
        category_id: selectedCategoryId,
        max_attendees: parseInt(maxAttendees),
        price: parseFloat(price) || 0,
        ticket_name: ticketName || 'General Admission',
        age_min: parseInt(minAge),
        age_max: parseInt(maxAge),
      }
      console.log("Payload",JSON.stringify(obj))
      await createEvent.mutateAsync(obj);

      Alert.alert(
        'Event Submitted',
        "Your event was created and is awaiting admin approval. It will appear publicly once approved.",
        [{ text: 'OK', onPress: safeGoBack }]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create event. Please try again.');
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    safeGoBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BrandLogo size="small" variant="full" />
          <View style={styles.headerTextContainer}>
            <Sparkles size={20} color={Colors.primary} />
            <Text style={styles.headerTitle}>Create Event</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 320 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your event"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          {categoriesLoading ? (
            <Text style={styles.helperText}>Loading categories…</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategoryId === cat.id && { backgroundColor: Colors.primary }
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategoryId === cat.id && styles.categoryChipTextSelected
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <View style={styles.inputWithIcon}>
            <Calendar size={18} color="#9CA3AF" />
            <TextInput
              style={styles.inputField}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Start Time *</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="14:30"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>End Time *</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="16:00"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Venue *</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={18} color="#9CA3AF" />
            <TextInput
              style={styles.inputField}
              value={venue}
              onChangeText={setVenue}
              placeholder="Full venue address"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Price ($)</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={18} color="#9CA3AF" />
              <TextInput
                style={styles.inputField}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Max attendees *</Text>
            <View style={styles.inputWithIcon}>
              <Users size={18} color="#9CA3AF" />
              <TextInput
                style={styles.inputField}
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="20"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ticket name</Text>
          <TextInput
            style={styles.input}
            value={ticketName}
            onChangeText={setTicketName}
            placeholder="General Admission"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Min Age *</Text>
            <TextInput
              style={styles.input}
              value={minAge}
              onChangeText={setMinAge}
              placeholder="3"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Max Age *</Text>
            <TextInput
              style={styles.input}
              value={maxAge}
              onChangeText={setMaxAge}
              placeholder="10"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        <BrandedButton
          title="Create Event"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          style={styles.submitButton}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.brandSurface,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  helperText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.brandSurface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.brandSurface,
  },
  inputField: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryChipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: Colors.textOnPrimary,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  addTagButton: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#4B5563',
  },
  submitButton: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing['4xl'],
  },
});