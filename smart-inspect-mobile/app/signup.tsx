import React from 'react';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useAPI } from '@/context/APIContext';


const SignUpPage = () => {
    const navigation = useNavigation();
    const api = useAPI();

    const [firstNameText, setFirstNameText] = useState('');
    const [lastNameText, setLastNameText] = useState('');
    const [emailText, setEmailText] = useState('');
    const [passwordText, setPasswordText] = useState('');
    const [confirmPasswordText, setConfirmPasswordText] = useState('');

    function handleBack() {
        navigation.goBack();
    }

    function handleLogin() {
        navigation.navigate('login' as never);
    }

    async function handleSignUp() {
        console.log('Sign Up');
        if (passwordText !== confirmPasswordText) {
            console.log('Passwords do not match');
            return;
        }

        const body = {
            email: emailText,
            password: passwordText,
            firstName: firstNameText,
            lastName: lastNameText
        }

        const response = await api.request('signup', 'POST', body, false);
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
                <Text style={styles.title}>Create{'\n'}New Account</Text>
                <InputField
                    variant="primary"
                    value={firstNameText}
                    placeholder="First Name"
                    autoCapitalize="words"
                    style={styles.input} />
                <InputField
                    variant="primary"
                    value={lastNameText}
                    placeholder="Last Name"
                    autoCapitalize="words"
                    style={styles.input} />
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
                <InputField
                    variant="primary"
                    value={confirmPasswordText}
                    placeholder="Confirm Password"
                    style={styles.input}
                    secureTextEntry />
            </View>
            <View style={{ alignItems: 'center', marginBottom: '15%' }}>
                <Button variant="primary" text="SIGN UP" onPress={handleSignUp} />
                <Text style={{ color: '#fff', marginTop: 35, fontFamily: 'Poppins-Regular' }}>Have an account? <TouchableOpacity onPress={handleLogin}><Text style={{ color: '#ffdb4f', marginBottom: -3, fontFamily: 'Poppins-SemiBold' }}>Log In</Text></TouchableOpacity></Text>
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
        marginBottom: '5%',
    },
    input: {
        marginBottom: 30,
        minWidth: 300
    },
});

export default SignUpPage;