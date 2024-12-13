import React, { useEffect } from 'react';
import Button from '@/components/Button';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { useAPI } from '@/context/APIContext';
import { useAuth } from '@/context/AuthContext';


export default function VerifyPage() {
    const navigation = useNavigation();
    const auth = useAuth();
    const api = useAPI();
    let intervalId: NodeJS.Timeout;

    function handleBack() {
        navigation.goBack();
    }

    async function resendVerifyEmail() {
        const response = await api.request('users/verify/send', 'GET', null, true);
        if (response.status !== 204) {
            console.log('Failed to resend verification email: ' + response.data.error);
            return;
        }
    }

    async function checkVerification() {
        const response = await api.request('users/verify', 'GET', null, true);
        if (response.status !== 200) {
            console.log('Verification failed: ' + response.data.error);
            return;
        }

        if (response.data.isAccountVerified) {
            console.log('Account verified');
            await auth.login(auth.id as string, response.data.accessToken, auth.refreshToken as string, response.data.isAccountVerified);
            clearInterval(intervalId);
            navigation.navigate('(tabs)' as never);
        }
    }

    useEffect(() => {
        resendVerifyEmail();

        intervalId = setInterval(async () => {
            console.log('Checking verification status');
            await checkVerification();
        }, 5000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

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
                <View style={[styles.inputContainer, { width: '75%' }]}>
                    <Text style={[styles.title, { alignSelf: 'center' }]}>Please Verify{'\n'}Your Account</Text>
                    <Text style={[styles.title, { alignSelf: 'center', textAlign: 'center' }]}>We have sent you an email with a verification link</Text>
                </View>
                <View style={styles.submitContainer}>
                    <Button variant="primary" text="RESEND EMAIL" onPress={resendVerifyEmail} />
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
        justifyContent: 'center'
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
        marginTop: -45,
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
    description: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        marginLeft: 5,
        width: '95%',
        wordWrap: 'break-word'
    },
    input: {
        marginBottom: 30,
        minWidth: 300
    },
});