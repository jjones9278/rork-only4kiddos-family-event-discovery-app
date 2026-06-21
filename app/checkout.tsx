// Native Stripe checkout for paid event bookings.
// Flow: the previous screen has already called useCreateBooking(), received a
// paymentIntentClientSecret + bookingId, and routed here. We init the Payment
// Sheet with that client secret, present it, and on success call
// useConfirmBooking() so Laravel marks the booking as confirmed.
import { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { BrandedButton } from '@/components/BrandedButton';
import { BrandedSpinner } from '@/components/BrandedSpinner';
import { AuthGuard } from '@/components/AuthGuard';
import { useConfirmBooking } from '@/hooks/use-events-laravel';
import { useToastHelpers } from '@/components/ToastProvider';
import { Colors, Typography, Spacing } from '@/constants/colors';

export default function Checkout() {
  const params = useLocalSearchParams();
  const bookingId = String(params.bookingId ?? '');
  const clientSecret = String(params.clientSecret ?? '');
  const eventTitle = String(params.eventTitle ?? 'Family Event');
  const amount = parseFloat(String(params.amount ?? '0')) || 0;

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const confirmBooking = useConfirmBooking();
  const { toastSuccess, toastError } = useToastHelpers();
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const presentedRef = useRef(false);

  useEffect(() => {
    if (!clientSecret) {
      setInitializing(false);
      return;
    }
    (async () => {
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Only4Kiddos',
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
        returnURL: 'only4kiddos://stripe-redirect',
      });
      if (error) {
        Alert.alert('Payment Setup Failed', error.message);
      } else {
        setReady(true);
      }
      setInitializing(false);
    })();
  }, [clientSecret, initPaymentSheet]);

  const handlePay = async () => {
    if (!ready || presentedRef.current) return;
    presentedRef.current = true;
    setPaying(true);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== 'Canceled') {
          toastError('Payment Failed', error.message);
        }
        presentedRef.current = false;
        return;
      }
      // Stripe succeeded. In DEV-BYPASS mode there's no Laravel booking to
      // confirm — we minted the PaymentIntent directly. Otherwise tell
      // Laravel to flip the booking to confirmed.
      if (bookingId !== 'DEV-BYPASS') {
        await confirmBooking.mutateAsync({ id: bookingId });
      }
      toastSuccess('Payment Successful', `Booking confirmed for ${eventTitle}.`);
      router.replace('/(tabs)/profile' as any);
    } catch (e: any) {
      toastError('Confirmation Failed', e?.message || 'Payment went through but the booking could not be confirmed. Contact support.');
      presentedRef.current = false;
    } finally {
      setPaying(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.centered}>
        <BrandedSpinner />
        <Text style={styles.subtle}>Setting up payment…</Text>
      </View>
    );
  }

  if (!clientSecret || !bookingId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Missing payment details. Please retry from the event page.</Text>
        <BrandedButton title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Unable to initialize payment. Please try again.</Text>
        <BrandedButton title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <AuthGuard>
      <Stack.Screen options={{ title: 'Purchase Tickets' }} />
      <View style={styles.container}>
        <Text style={styles.title}>{eventTitle}</Text>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        <BrandedButton
          title={paying ? 'Processing…' : 'Pay with Card'}
          onPress={handlePay}
          disabled={paying || confirmBooking.isPending}
        />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, backgroundColor: Colors.brandBackground, justifyContent: 'center', gap: Spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.brandBackground },
  title: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, textAlign: 'center' },
  amount: { fontSize: Typography.fontSizes['2xl'], fontWeight: Typography.fontWeights.bold, color: Colors.primary, textAlign: 'center' },
  subtle: { color: Colors.textSecondary, marginTop: Spacing.md },
  error: { color: Colors.error || '#DC2626', textAlign: 'center', marginBottom: Spacing.md },
});
