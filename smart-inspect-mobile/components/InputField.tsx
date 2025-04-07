import { ColorTypes, useColor } from '@/context/ColorContext';
import React, { useState } from 'react';
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputEndEditingEventData, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface InputFieldProps {
    variant: 'primary' | 'secondary' | 'tertiary';
    placeholder: string;
    placeholderTextColor?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
    onChangeText?: (text: string) => void;
    onEndEditing?: (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => void;
    value?: string;
    eyeColor?: string;
    style?: object;
}

const InputField: React.FC<InputFieldProps> = ({ variant, placeholder, placeholderTextColor, keyboardType, autoCapitalize, secureTextEntry, onChangeText, onEndEditing, value, eyeColor = "#fff", style }) => {
    const color = useColor();
    const styles = getStyles(color.getColors());

    let inputFieldStyle: any;
    const [passwordHidden, setPasswordHidden] = useState(secureTextEntry);

    function handlePasswordVisibility() {
        setPasswordHidden(!passwordHidden);
    };

    switch (variant) {
        case 'primary':
            inputFieldStyle = styles.primary;
            if (!placeholderTextColor) {
                placeholderTextColor = color.getColors().textPlaceholder;
            }
            break;
        case 'secondary':
            inputFieldStyle = styles.secondary;
            if (!placeholderTextColor) {
                placeholderTextColor = color.getColors().textPlaceholder;
            }
            break;
        case 'tertiary':
            inputFieldStyle = styles.tertiary;
            if (!placeholderTextColor) {
                placeholderTextColor = color.getColors().textPlaceholder;
            }
            break;
    }

    return (
        <>
            {secureTextEntry ? (
                <TouchableOpacity
                    onPress={handlePasswordVisibility}
                    style={{ marginBottom: variant === 'primary' ? -35 : -25, alignSelf: 'flex-end', padding: 5, zIndex: 1 }}
                >
                    <Icon name={passwordHidden ? 'eye' : 'eye-slash'} size={15} color={eyeColor} />
                </TouchableOpacity>
            ) : <></>}
            <TextInput
                style={[inputFieldStyle, style]}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                secureTextEntry={passwordHidden}
                onChangeText={onChangeText}
                onEndEditing={onEndEditing}
                value={value}
            />
        </>
    );
};

//style={{ marginTop: -58, alignSelf: 'flex-end' }}

function getStyles(color: ColorTypes) {
    return StyleSheet.create({
        primary: {
            height: 40,
            borderBottomColor: '#fff',
            borderBottomWidth: 1,
            color: '#fff',
            fontFamily: 'Poppins-Regular',
        },
        secondary: {
            height: 40,
            borderBottomColor: color.borderColor,
            borderBottomWidth: 1,
            color: color.textColor,
            fontFamily: 'Poppins-Regular',
        },
        tertiary: {
            height: 50,
            //borderColor: color.border,
            //borderWidth: 0.5,
            backgroundColor: color.foregroundColor,
            color: color.textColor,
            borderRadius: 25,
            paddingLeft: 25,
            shadowColor: color.shadowColor,
            fontFamily: 'Poppins',
            fontSize: 16,
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.4,
        },
    });
}

export default InputField;