import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Button from '@/components/Button';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/utils/rootNavigation';

const LandingPage = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    function handleLogin() {
        navigation.navigate('login' as never);
    }

    function handleSignUp() {
        navigation.navigate('signup' as never);
    }

    return (
        <View style={styles.topView}>
            <Image
                source={require('@/assets/images/login_background.png')}
                style={styles.backgroundImage}
            />
            <View style={styles.container}>
                <Image
                    source={require('@/assets/images/karins_logo.png')}
                    style={styles.logoImage}
                />
                <Text style={styles.title}>KARINS</Text>
                <Text style={styles.description}>Engineering</Text>
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
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    logoImage: {
        width: 50,
        height: 50,
        margin: 10,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        resizeMode: 'cover',
    },
    overlay: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent overlay
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Poppins-Bold',
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: -10,
        letterSpacing: 3,
    },
    description: {
        fontFamily: 'Poppins',
        color: '#fff',
        fontSize: 14,
        fontWeight: 'regular',
        marginBottom: 80,
    }
});

export default LandingPage;