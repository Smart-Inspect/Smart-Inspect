import React from 'react';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { View, StyleSheet, Image, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAPI } from '@/context/APIContext';


const LoginPage = () => {
    const navigation = useNavigation();
    const auth = useAuth();
    const api = useAPI();

    const [emailText, setEmailText] = useState('');
    const [passwordText, setPasswordText] = useState('');
    const [loginFailed, setLoginFailed] = useState(false);

    function handleBack() {
        navigation.goBack();
    }

    async function handleLogin() {
        console.log('Login');
        navigation.navigate('verify' as never);
        const body = {
            email: emailText,
            password: passwordText
        }
        const response = await api.request('login', 'POST', body, false);
        if (response.status !== 200) {
            console.log('Login failed');
            setLoginFailed(true);
            return;
        }

        auth.login({ id: response.data.id, accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });

        if (!response.data.isAccountVerified) {
            console.log('Account not verified');
            navigation.navigate('verify' as never);
        } else {
            console.log('Account verified');
            navigation.navigate('(tabs)' as never);
        }
    }

    function handleForgotPassword() {
        navigation.navigate('forgotpassword' as never);
    }

    function handleSignUp() {
        navigation.navigate('signup' as never);
    }

    return (
        <View style={styles.topView}>
            <View style={{ marginTop: 50, marginRight: 20, marginLeft: 20, marginBottom: '5%', }}>
                <TouchableOpacity onPress={handleBack} style={{ alignSelf: 'flex-start' }}>
                    <Icon name="chevron-left" size={25} color="#fff" style={{ marginTop: 40, marginLeft: 5, paddingVertical: 10, paddingHorizontal: 15 }} />
                </TouchableOpacity>
                <Image
                    source={require('@/assets/images/smart-inspect_logo.png')}
                    style={styles.image}
                />
            </View>
            <View style={styles.container}>
                {!loginFailed ?
                    <Text style={styles.title}>Hi!{'\n'}Welcome Back,</Text> :
                    <Text style={styles.title}>Incorrect Email or{'\n'}Password{'\n\n'}Please try again.</Text>
                }
                <InputField
                    variant="primary"
                    onChangeText={emailText => setEmailText(emailText)}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input} />
                <InputField
                    variant="primary"
                    onChangeText={passwordText => setPasswordText(passwordText)}
                    placeholder="Password"
                    style={styles.input}
                    secureTextEntry />
                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={{ color: '#fff', alignSelf: 'flex-end', fontFamily: 'Poppins-Regular' }}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center', marginBottom: '15%' }}>
                <Button variant="primary" text="LOGIN" onPress={handleLogin} />
                <Text style={{ color: '#fff', marginTop: 35, fontFamily: 'Poppins-Regular' }}>Don't have an account? <TouchableOpacity onPress={handleSignUp}><Text style={{ color: '#ffdb4f', marginBottom: -5, fontFamily: 'Poppins-SemiBold' }}>Sign Up</Text></TouchableOpacity></Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topView: {
        flex: 1,
        backgroundColor: '#20575a',
    },
    container: {
        flex: 1,
        alignSelf: 'center',
        marginTop: '10%'
    },
    image: {
        width: 60,
        height: 60,
        marginTop: -55,
        marginRight: 20,
        alignSelf: 'flex-end'
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