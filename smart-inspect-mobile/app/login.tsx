import React from 'react';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAPI } from '@/context/APIContext';


const LoginPage = () => {
    const navigation = useNavigation();
    const auth = useAuth();
    const api = useAPI();

    const [emailText, setEmailText] = useState('');
    const [passwordText, setPasswordText] = useState('');

    function handleBack() {
        navigation.goBack();
    }

    async function handleLogin() {
        console.log('Login');
        const body = {
            email: emailText,
            password: passwordText
        }
        const response = await api.request('login', 'POST', body, false);
        auth.login({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
    }

    function handleForgotPassword() {
        navigation.navigate('forgotpassword' as never);
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
            <View style={{ marginTop: 50, marginRight: 20, marginLeft: 20, marginBottom: '20%', }}>
                <TouchableOpacity onPress={handleBack} style={{ alignSelf: 'flex-start' }}>
                    <Icon name="chevron-left" size={25} color="#fff" style={{ marginTop: 50, marginLeft: 20 }} />
                </TouchableOpacity>
                <Image
                    source={require('@/assets/images/karins_logo.png')}
                    style={{ width: 50, height: 50, marginTop: -40, marginRight: 20, alignSelf: 'flex-end' }}
                />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Hi!{'\n'}Welcome Back,</Text>
                <InputField
                    variant="primary"
                    value={emailText}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input} />
                <InputField
                    variant="primary"
                    value={passwordText}
                    placeholder="Password"
                    style={styles.input}
                    secureTextEntry />
                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={{ color: '#fff', alignSelf: 'flex-end', fontFamily: 'Poppins-Regular' }}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center', marginBottom: '15%' }}>
                <Button variant="primary" text="LOGIN" onPress={handleLogin} />
                <Text style={{ color: '#fff', marginTop: 35, fontFamily: 'Poppins-Regular' }}>Don't have an account? <TouchableOpacity onPress={handleSignUp}><Text style={{ color: '#ffdb4f', marginBottom: -3, fontFamily: 'Poppins-SemiBold' }}>Sign Up</Text></TouchableOpacity></Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topView: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignSelf: 'center',
        position: 'relative'
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffdb4f',
        marginBottom: '20%',
    },
    input: {
        marginBottom: 30,
        minWidth: 300
    },
});

export default LoginPage;