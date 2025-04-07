import { APIProvider } from "@/context/APIContext";
import { AuthProvider } from "@/context/AuthContext";
import { ColorProvider } from '@/context/ColorContext';
import { RequestsProvider } from "@/context/RequestsContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import storage from '@/utils/storage';

export default function RootLayout() {
  const [loaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Poppins': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
  });

  return (
    <AuthProvider>
      <APIProvider>
        <RequestsProvider>
          <ColorProvider>
            <UnprotectedLayout />
          </ColorProvider>
        </RequestsProvider>
      </APIProvider>
    </AuthProvider>
  );
}

function UnprotectedLayout() {
  /*useEffect(() => {
    storage.clearAllStorage();
    storage.checkStorage();
  }, []);*/

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="invalidpermission" options={{ headerShown: false }} />
    </Stack>
  );
}
