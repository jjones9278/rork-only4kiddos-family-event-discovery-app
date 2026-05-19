// Premium subscription component for Only4kiddos family features
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useRouter, Stack, router } from 'expo-router';
import { BrandedButton } from '@/components/BrandedButton';
import { BrandedHeader } from '@/components/BrandedHeader';
import { BrandedSpinner } from '@/components/BrandedSpinner';
import { AuthGuard } from '@/components/AuthGuard';

// Load Stripe (will be configured with environment variable)
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const SubscribeForm = () => {
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
        return_url: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      Alert.alert(
        "Subscription Failed",
        error.message || "There was an issue processing your subscription. Please try again.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Welcome to Premium!", 
        "Your premium family features are now active!",
        [{ text: "OK", onPress: () => router.push('/profile') }]
      );
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-blue-600 mb-4">
          Premium Family Features
        </Text>
        
        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold mb-2">What's included:</Text>
          <Text className="text-gray-700 mb-1">• Priority event notifications</Text>
          <Text className="text-gray-700 mb-1">• Advanced filters and search</Text>
          <Text className="text-gray-700 mb-1">• Family calendar integration</Text>
          <Text className="text-gray-700 mb-1">• Exclusive member-only events</Text>
          <Text className="text-gray-700 mb-1">• Custom event reminders</Text>
          <Text className="text-gray-700">• Ad-free experience</Text>
        </View>

        <Text className="text-center text-2xl font-bold text-green-600 mb-6">
          $9.99/month
        </Text>
      </View>
      
      <View className="mb-6">
        <PaymentElement />
      </View>
      
      <BrandedButton
        title="Subscribe to Premium"
        onPress={handleSubmit}
        disabled={!stripe || !elements}
      />
      
      <Text className="text-center text-xs text-gray-500 mt-4">
        Cancel anytime from your profile settings
      </Text>
    </ScrollView>
  );
};

export default function Premium() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create subscription for premium features
    const createSubscription = async () => {
      try {
        const response = await fetch('/api/get-or-create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        Alert.alert(
          "Error", 
          "Unable to initialize subscription. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    };

    createSubscription();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <BrandedSpinner />
        <Text className="mt-4 text-gray-600">Setting up subscription...</Text>
      </View>
    );
  }

  if (!clientSecret) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-center text-red-500 mb-4">
          Unable to initialize subscription. Please try again.
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
        <Stack.Screen options={{ title: 'Premium Subscription' }} />
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <SubscribeForm />
      </Elements>
      </View>
    </AuthGuard>
  );
}