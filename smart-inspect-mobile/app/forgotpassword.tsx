import React from 'react';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';


const ForgotPasswordPage = () => {
    const navigation = useNavigation();

    function handleBack() {
        navigation.goBack();
    }

    function handleForgotPassword() {
        console.log('Forgot Password');
        // TODO: Implement forgot password logic
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
                <Text style={styles.title}>Forgot{'\n'}Password?</Text>
                <InputField
                    variant="primary"
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input} />
            </View>
            <View style={{ alignItems: 'center', marginBottom: '15%' }}>
                <Button variant="primary" text="SEND EMAIL" onPress={handleForgotPassword} />
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

export default ForgotPasswordPage;