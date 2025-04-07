import { useColor } from "@/context/ColorContext";
import { Stack } from "expo-router";

export default function HomeLayout() {
    const color = useColor();

    return (
        <Stack screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: color.getColors().headerColor },
            headerTintColor: color.getColors().headerTintColor,
        })}>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: true }} />
            <Stack.Screen name="[projectId]" options={{ title: 'Project', headerShown: true }} />
            <Stack.Screen name="inspection/[inspectionId]" options={{ title: 'Inspection', headerShown: true }} />
            <Stack.Screen name="inspection/start/[inspectionId]" options={{ title: 'Start Inspection', headerShown: true }} />
        </Stack>
    );
}