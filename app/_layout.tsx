import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// MailerLite is now handled by the backend - no client initialization needed
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ToastProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import { trpc, trpcClient } from "@/lib/trpc";

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
      <Stack.Screen 
        name="login" 
        options={{ 
          title: "Sign In",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          title: "Create Account",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: "Notifications",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    // MailerLite is now handled securely by the backend
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <GestureHandlerRootView>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}