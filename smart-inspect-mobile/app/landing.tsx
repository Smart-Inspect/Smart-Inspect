import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Button from '@/components/Button';
import { useNavigation } from 'expo-router';

export default function LandingPage() {
    const navigation = useNavigation();

    function handleLogin() {
        navigation.navigate('login' as never);
    }

    function handleSignUp() {
        navigation.navigate('signup' as never);
    }

    return (
        <View style={styles.topView}>
            <View style={styles.container}>
                <Image
                    source={require('@/assets/images/smart-inspect_logo.png')}
                    style={styles.logoImage}
                />
                <Text style={styles.title}>Smart</Text>
                <Text style={styles.description}>Inspect</Text>
                <Button variant="primary" text="LOGIN" onPress={handleLogin} />
                <Button variant="primary-outline" text="SIGN UP" onPress={handleSignUp} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#20575a',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    logoImage: {
        width: 100,
        height: 100,
        margin: -10,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        resizeMode: 'cover',
    },
    title: {
        fontFamily: 'Poppins-Bold',
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: -5,
        letterSpacing: 3,
    },
    description: {
        fontFamily: 'Poppins',
        color: '#fff',
        fontSize: 16,
        fontWeight: 'regular',
        marginBottom: 80,
    }
});