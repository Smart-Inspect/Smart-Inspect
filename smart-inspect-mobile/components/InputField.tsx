import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface InputFieldProps {
    variant: 'primary' | 'primary-outline';
    value?: string;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
    style?: object;
}

const InputField: React.FC<InputFieldProps> = ({ variant, value, placeholder, keyboardType, autoCapitalize, secureTextEntry, style }) => {
    let inputFieldStyle: any;
    const [passwordHidden, setPasswordHidden] = useState(secureTextEntry);

    function handlePasswordVisibility() {
        setPasswordHidden(!passwordHidden);
    };

    switch (variant) {
        case 'primary':
            inputFieldStyle = styles.primary;
            break;
        // Add more variants here
    }

    return (
        <>
            <TextInput
                value={value}
                style={[inputFieldStyle, style]}
                placeholder={placeholder}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                secureTextEntry={passwordHidden}
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
});

export default InputField;