import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Profile",
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1F2937',
        }} 
      />
    </Stack>
  );
}