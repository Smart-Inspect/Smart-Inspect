import React, { useEffect, useState } from 'react';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { useRequests } from '@/context/RequestsContext';

export default function ForgotPasswordPage() {
    const navigation = useNavigation();
    const { users } = useRequests();
    const [emailText, setEmailText] = useState('');
    const [requiredFieldEmpty, setRequiredFieldEmpty] = useState({ email: false });
    const [title, setTitle] = useState('Forgot\nPassword?');

    function handleBack() {
        navigation.goBack();
    }

    async function handleForgotPassword() {
        if (emailText === '') {
            console.log('Email is required');
            setRequiredFieldEmpty({ ...requiredFieldEmpty, email: true });
            return;
        }
        if (!await users.forgotPassword(emailText)) {
            setTitle('Error\nSending Email');
            return;
        }
        handleBack();
    }

    function handleSignUp() {
        navigation.reset({ index: 1, routes: [{ name: 'landing' as never }, { name: 'signup' as never }] });
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
                    <Text style={styles.title}>{title}</Text>
                    <InputField
                        variant="primary"
                        onChangeText={emailText => setEmailText(emailText)}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input} />
                    <Text style={styles.requiredField}>{requiredFieldEmpty.email ? 'This field is required.' : ''}</Text>
                </View>
                <View style={styles.submitContainer}>
                    <Button variant="primary" text="SEND EMAIL" onPress={handleForgotPassword} />
                    <Text style={{ color: '#fff', marginTop: 35, fontFamily: 'Poppins-Regular' }}>Don't have an account? <TouchableOpacity onPress={handleSignUp}><Text style={{ color: '#ffdb4f', marginBottom: -5, fontFamily: 'Poppins-SemiBold' }}>Sign Up</Text></TouchableOpacity></Text>
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
        marginBottom: '20%',
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