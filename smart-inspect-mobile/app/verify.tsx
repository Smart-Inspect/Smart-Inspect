import React, { useCallback, useEffect, useState } from 'react';
import Button from '@/components/Button';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { useAPI } from '@/context/APIContext';
import { useAuth } from '@/context/AuthContext';
import { useRequests } from '@/context/RequestsContext';

export default function VerifyPage() {
    const navigation = useNavigation();
    const auth = useAuth();
    const api = useAPI();
    let intervalId: NodeJS.Timeout;
    const [title, setTitle] = useState('Please Verify\nYour Account');
    const [content, setContent] = useState('We have sent you an email with a verification link');
    const { users } = useRequests();
    const [sentInitialEmail, setSentInitialEmail] = useState(false);

    function handleBack() {
        navigation.goBack();
    }

    function goToApp() {
        navigation.reset({ index: 0, routes: [{ name: '(tabs)' as never }] });
    }

    const resendVerifyEmail = useCallback(async (abort?: AbortController) => {
        if (sentInitialEmail && abort) {
            return;
        }

        console.log('Resending verification email');
        const response = await users.sendVerificationEmail(abort);

        if (response !== 'abort') {
            setSentInitialEmail(true);
        }

        if (response === 'success') {
            setTitle('Please Verify\nYour Account');
            setContent('We have sent you an email with a verification link');
        } else if (response === 'fail') {
            setTitle('Error Resending\nEmail');
            setContent('There was an error resending the email.');
        }
    }, [sentInitialEmail, users]);

    async function checkVerification() {
        const response = await users.checkVerification()
        if (response !== 'fail') {
            if (response.isAccountVerified) {
                console.log('Account verified');
                goToApp();
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        resendVerifyEmail(controller);

        intervalId = setInterval(async () => {
            console.log('Checking verification status');
            await checkVerification();
        }, 5000);

        // Clear interval and abort controller if user navigates away
        // This should ideally never occur if the navigation stack is done properly (this page should always get unmounted)
        // But just in case, we'll add this here
        if (!navigation.isFocused()) {
            clearInterval(intervalId);
            controller.abort();
        }

        return () => {
            clearInterval(intervalId);
            controller.abort();
        };
    }, [api, auth, resendVerifyEmail, users]);

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
                    <Text style={[styles.title, { alignSelf: 'center' }]}>{title}</Text>
                    <Text style={[styles.title, { alignSelf: 'center', textAlign: 'center' }]}>{content}</Text>
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