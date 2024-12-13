import { APIProvider, useAPI } from "@/context/APIContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ColorProvider } from '@/context/ColorContext';
import { useFonts } from "expo-font";
import { Stack, useNavigation } from "expo-router";
import { useEffect } from "react";

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
        <ColorProvider>
          <MainLayout />
        </ColorProvider>
      </APIProvider>
    </AuthProvider>
  );
}

function MainLayout() {
  const { isAuthenticated, isVerified, id } = useAuth();
  const navigation = useNavigation();
  const api = useAPI();

  const checkConnected = async () => {
    try {
      const response = await api.request('', 'GET', null, false);
      if (response.status === 200) {
        console.log('Connected to server');
      }
      else {
        console.log('Failed to connect to server: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error fetching server status:', error);
    }
  };

  /*useEffect(() => {
        storage.clearAllStorage();
        storage.checkStorage();
    }, []);*/

  useEffect(() => {
    checkConnected();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isVerified) {
      console.log(`Authenticated = ${isAuthenticated}, Verified = ${isVerified}, redirecting to landing page`);
      navigation.navigate('landing' as never);
    } else {
      console.log(`Authenticated = ${isAuthenticated}, Verified = ${isVerified}, redirecting to tabs`);
      navigation.navigate('(tabs)' as never);
    }
  }, [isAuthenticated, isVerified]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
    </Stack>
  );
}
