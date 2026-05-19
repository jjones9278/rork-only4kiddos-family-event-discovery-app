import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Search Events",
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1F2937',
        }} 
      />
    </Stack>
  );
}