import React from 'react';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { View, StyleSheet, Image, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import { useAPI } from '@/context/APIContext';


export default function SignUpPage() {
    const navigation = useNavigation();
    const api = useAPI();

    const [firstNameText, setFirstNameText] = useState('');
    const [lastNameText, setLastNameText] = useState('');
    const [emailText, setEmailText] = useState('');
    const [passwordText, setPasswordText] = useState('');
    const [confirmPasswordText, setConfirmPasswordText] = useState('');
    const [requiredFieldEmpty, setRequiredFieldEmpty] = useState({ firstName: false, lastName: false, email: false, password: false, confirmPassword: false });
    const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
    const [signupFailed, setSignupFailed] = useState(false);

    function handleBack() {
        navigation.goBack();
    }

    function handleLogin() {
        navigation.navigate('login' as never);
    }

    async function handleSignUp() {
        if (firstNameText === '') {
            console.log('First Name is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, firstName: true });
            return;
        }
        if (lastNameText === '') {
            console.log('Last Name is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, lastName: true });
            return;
        }
        if (emailText === '') {
            console.log('Email is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, email: true });
            return;
        }
        if (passwordText === '') {
            console.log('Password is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, password: true });
            return;
        }
        if (confirmPasswordText === '') {
            console.log('Confirm Password is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, confirmPassword: true });
            return;
        }

        if (passwordText !== confirmPasswordText) {
            console.log('Passwords do not match');
            setPasswordsDoNotMatch(true);
            return;
        }

        const body = {
            email: emailText,
            password: passwordText,
            firstName: firstNameText,
            lastName: lastNameText
        }

        const response = await api.request('users/create', 'POST', body, false);
        if (response.status !== 201) {
            console.log('Sign up failed: ' + response.data.error);
            return;
        }
        console.log('Sign Up successful');
        navigation.navigate('login' as never);
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
            <View style={styles.mainContainer}>
                <View style={styles.inputContainer}>
                    {!signupFailed ?
                        <Text style={styles.title}>Create{'\n'}New Account</Text> :
                        <Text style={styles.title}>Sign-Up Failed{'\n'}Please try again.</Text>
                    }
                    <InputField
                        variant="primary"
                        onChangeText={firstNameText => setFirstNameText(firstNameText)}
                        placeholder="First Name"
                        autoCapitalize="words"
                        style={styles.input} />
                    <Text style={styles.requiredField}>{requiredFieldEmpty.firstName ? 'This field is required.' : ''}</Text>
                    <InputField
                        variant="primary"
                        onChangeText={lastNameText => setLastNameText(lastNameText)}
                        placeholder="Last Name"
                        autoCapitalize="words"
                        style={styles.input} />
                    <Text style={styles.requiredField}>{requiredFieldEmpty.lastName ? 'This field is required.' : ''}</Text>
                    <InputField
                        variant="primary"
                        onChangeText={emailText => setEmailText(emailText)}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input} />
                    <Text style={styles.requiredField}>{requiredFieldEmpty.email ? 'This field is required.' : ''}</Text>
                    <InputField
                        variant="primary"
                        onChangeText={passwordText => setPasswordText(passwordText)}
                        placeholder="Password"
                        style={styles.input}
                        secureTextEntry />
                    <Text style={styles.requiredField}>{requiredFieldEmpty.password ? 'This field is required.' : ''}</Text>
                    <InputField
                        variant="primary"
                        onChangeText={confirmPasswordText => setConfirmPasswordText(confirmPasswordText)}
                        placeholder="Confirm Password"
                        style={styles.input}
                        secureTextEntry />
                    <Text style={styles.requiredField}>{requiredFieldEmpty.confirmPassword ? 'This field is required.' : ''}</Text>
                    <Text style={{ color: '#ffdb4f', marginTop: -20, fontFamily: 'Poppins-Light' }}>{passwordsDoNotMatch ? 'Passwords do not match. Please try again.' : ''}</Text>
                </View>
                <View style={styles.submitContainer}>
                    <Button variant="primary" text="SIGN UP" onPress={handleSignUp} />
                    <Text style={{ color: '#fff', marginTop: 35, fontFamily: 'Poppins-Regular' }}>Have an account? <TouchableOpacity onPress={handleLogin}><Text style={{ color: '#ffdb4f', marginBottom: -5, fontFamily: 'Poppins-SemiBold' }}>Log In</Text></TouchableOpacity></Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topView: {
        flex: 1,
        backgroundColor: '#20575a',
    },
    mainContainer: { 
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        marginTop: '-10%',
        height: 450
    },
    submitContainer: {
        height: 125,
        alignItems: 'center'
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
        marginBottom: '5%',
    },
    input: {
        marginBottom: 30,
        minWidth: 300
    },
    requiredField: {
        color: '#ffdb4f',
        marginTop: -20,
        fontFamily: 'Poppins-Light',
        alignSelf: 'flex-end'
    }
});