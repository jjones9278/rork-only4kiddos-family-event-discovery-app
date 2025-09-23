// Event ticket checkout component for Only4kiddos family events
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack, router } from 'expo-router';
import { BrandedButton } from '@/components/BrandedButton';
import { BrandedHeader } from '@/components/BrandedHeader';
import { BrandedSpinner } from '@/components/BrandedSpinner';
import { AuthGuard } from '@/components/AuthGuard';

// Load Stripe (will be configured with environment variable)
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm = ({ eventTitle, amount }: { eventTitle: string, amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/event/confirmation`,
      },
    });

    if (error) {
      Alert.alert(
        "Payment Failed",
        error.message || "There was an issue processing your payment. Please try again.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Payment Successful", 
        `Thank you for purchasing tickets to ${eventTitle}!`,
        [{ text: "OK", onPress: () => router.push('/profile') }]
      );
    }
  };

  return (
    <View className="flex-1 p-4">
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          Event: {eventTitle}
        </Text>
        <Text className="text-2xl font-bold text-blue-600">
          ${amount.toFixed(2)}
        </Text>
      </View>
      
      <View className="mb-6">
        <PaymentElement />
      </View>
      
      <BrandedButton
        title="Purchase Tickets"
        onPress={handleSubmit}
        disabled={!stripe || !elements}
      />
    </View>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const { eventId, eventTitle, amount } = useLocalSearchParams();
  
  const eventName = Array.isArray(eventTitle) ? eventTitle[0] : eventTitle || 'Family Event';
  const ticketPrice = Array.isArray(amount) ? parseFloat(amount[0]) : parseFloat(amount as string) || 25.00;

  useEffect(() => {
    // Create PaymentIntent for event ticket purchase
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: ticketPrice,
            eventId: eventId 
          }),
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        Alert.alert(
          "Error", 
          "Unable to initialize payment. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [eventId, ticketPrice]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <BrandedSpinner />
        <Text className="mt-4 text-gray-600">Setting up payment...</Text>
      </View>
    );
  }

  if (!clientSecret) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-center text-red-500 mb-4">
          Unable to initialize payment. Please try again.
        </Text>
        <BrandedButton
          title="Go Back"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <AuthGuard>
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ title: 'Purchase Tickets' }} />
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm eventTitle={eventName} amount={ticketPrice} />
      </Elements>
      </View>
    </AuthGuard>
  );
}