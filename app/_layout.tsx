import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EventsProvider } from "@/hooks/use-events";
import { initializeMailerLite } from "@/services/mailerlite";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="event/[id]" 
        options={{ 
          title: "Event Details",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="create-event" 
        options={{ 
          title: "Create Event",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="filters" 
        options={{ 
          title: "Filters",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="add-child" 
        options={{ 
          title: "Add Child",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          title: "Purchase Tickets",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="premium" 
        options={{ 
          title: "Premium Subscription",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="newsletter-settings" 
        options={{ 
          title: "Email Preferences",
          presentation: "card",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Initialize MailerLite service
    const apiKey = process.env.EXPO_PUBLIC_MAILERLITE_API_KEY;
    if (apiKey) {
      try {
        initializeMailerLite(apiKey);
        console.log('MailerLite service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MailerLite:', error);
      }
    } else {
      console.warn('EXPO_PUBLIC_MAILERLITE_API_KEY not found');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EventsProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </EventsProvider>
    </QueryClientProvider>
  );
}