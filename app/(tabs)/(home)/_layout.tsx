import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Only4kiddos",
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1F2937',
        }} 
      />
    </Stack>
  );
}