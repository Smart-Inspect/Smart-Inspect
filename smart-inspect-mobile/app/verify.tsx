import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';
import { useAPI } from '@/context/APIContext';
import { useAuth } from '@/context/AuthContext';


const ForgotPasswordPage = () => {
    const navigation = useNavigation();
    const auth = useAuth();
    const api = useAPI();

    function handleBack() {
        navigation.goBack();
    }

    useEffect(() => {
        const checkVerification = async () => {
            const response = await api.request('verify', 'GET', null, false);
            if (response.status !== 200) {
                console.log('Verification failed');
                return;
            }

            if (response.data.isAccountVerified) {
                console.log('Account verified');
                auth.login({ id: auth.id as string, accessToken: response.data.accessToken, refreshToken: auth.refreshToken as string });
                navigation.navigate('(tabs)' as never);
            }
        }

        const intervalId = setInterval(checkVerification, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <View style={styles.topView}>
            <View style={{ marginTop: 50, marginRight: 20, marginLeft: 20, marginBottom: '20%', }}>
                <TouchableOpacity onPress={handleBack} style={{ alignSelf: 'flex-start' }}>
                    <Icon name="chevron-left" size={25} color="#fff" style={{ marginTop: 50, marginLeft: 20 }} />
                </TouchableOpacity>
                <Image
                    source={require('@/assets/images/smart-inspect_logo.png')}
                    style={styles.image}
                />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Please Verify{'\n'}Your Account</Text>
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
        position: 'relative'
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
    input: {
        marginBottom: 30,
        minWidth: 300
    },
});

export default ForgotPasswordPage;