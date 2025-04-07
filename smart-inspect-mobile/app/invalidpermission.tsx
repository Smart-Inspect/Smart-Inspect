import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';

export default function InvalidPermissionPage() {
    const navigation = useNavigation();
    const [title] = useState('Invalid Permissions');
    const [content] = useState('You do not have permission to use this application');

    function handleBack() {
        navigation.goBack();
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
                <View style={[styles.inputContainer, { width: '75%' }]}>
                    <Text style={[styles.title, { alignSelf: 'center' }]}>{title}</Text>
                    <Text style={[styles.title, { alignSelf: 'center', textAlign: 'center' }]}>{content}</Text>
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
    }
});