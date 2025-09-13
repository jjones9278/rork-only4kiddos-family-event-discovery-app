import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EventsProvider } from "@/hooks/use-events";

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
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
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