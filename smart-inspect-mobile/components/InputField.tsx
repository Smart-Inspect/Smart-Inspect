import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface InputFieldProps {
    variant: 'primary' | 'secondary';
    placeholder: string;
    placeholderTextColor?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
    onChangeText?: (text: string) => void;
    style?: object;
}

const InputField: React.FC<InputFieldProps> = ({ variant, placeholder, placeholderTextColor, keyboardType, autoCapitalize, secureTextEntry, onChangeText, style }) => {
    let inputFieldStyle: any;
    const [passwordHidden, setPasswordHidden] = useState(secureTextEntry);

    function handlePasswordVisibility() {
        setPasswordHidden(!passwordHidden);
    };

    switch (variant) {
        case 'primary':
            inputFieldStyle = styles.primary;
            if (!placeholderTextColor) {
                placeholderTextColor = '#fff';
            }
            break;
        case 'secondary':
            inputFieldStyle = styles.secondary;
            if (!placeholderTextColor) {
                placeholderTextColor = '#ccc';
            }
            break;
    }

    return (
        <>
            <TextInput
                style={[inputFieldStyle, style]}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                secureTextEntry={passwordHidden}
                onChangeText={onChangeText}
            />
            {secureTextEntry ? (
                <TouchableOpacity
                    onPress={handlePasswordVisibility}
                >
                    <Icon style={{ marginTop: -58, marginLeft: 285 }} name={passwordHidden ? 'eye' : 'eye-slash'} size={15} color="#fff" />
                </TouchableOpacity>
            ) : <></>}
        </>
    );
};

const styles = StyleSheet.create({
    primary: {
        height: 40,
        borderBottomColor: '#fff',
        borderBottomWidth: 1,
        color: '#fff',
        fontFamily: 'Poppins-Regular',
    },
    secondary: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        color: '#000',
        borderRadius: 5,
        paddingLeft: 10
    },
});

export default InputField;