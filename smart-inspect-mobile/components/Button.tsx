import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ButtonProps {
    variant: 'primary' | 'primary-outline';
    text: string;
    onPress?: () => void;
    style?: object;
}

const Button: React.FC<ButtonProps> = ({ variant, text, onPress, style }) => {
    let buttonStyle: any;
    let buttonStyleText: any;

    switch (variant) {
        case 'primary':
            buttonStyle = styles.primary;
            buttonStyleText = styles.primaryText;
            break;
        case 'primary-outline':
            buttonStyle = styles.primaryOutline;
            buttonStyleText = styles.primaryOutlineText;
            break;
        // Add more variants here
    }

    return (
        <TouchableOpacity style={[buttonStyle, style]} onPress={onPress}>
            <Text style={buttonStyleText}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    primary: {
        backgroundColor: '#ffdb4f',
        borderColor: '#ffdb4f',
        borderWidth: 2,
        padding: 5,
        borderRadius: 25,
        width: 200,
        alignItems: 'center',
        margin: 10,
    },
    primaryText: {
        color: '#053331',
        fontFamily: 'Poppins-Bold',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 18,
    },
    primaryOutline: {
        backgroundColor: 'transparent',
        borderColor: '#ffdb4f',
        borderWidth: 2,
        padding: 5,
        borderRadius: 25,
        width: 200,
        alignItems: 'center',
        margin: 10,
    },
    primaryOutlineText: {
        color: '#ffdb4f',
        fontFamily: 'Poppins-Bold',
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 18,
    },
});

export default Button;