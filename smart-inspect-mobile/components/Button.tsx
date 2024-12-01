import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ButtonProps {
    variant: 'primary' | 'primary-outline' | 'secondary' | 'danger';
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
        case 'secondary':
            buttonStyle = styles.secondary;
            buttonStyleText = styles.secondaryText;
            break;
        case 'danger':
            buttonStyle = styles.danger;
            buttonStyleText = styles.dangerText;
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
    secondary: {
        //backgroundColor: '#053331',
        backgroundColor: 'rgba(5, 51, 49, 0.45)',
        borderColor: '#053331',
        borderWidth: 1,
        padding: 8,
        borderRadius: 10,
        //width: 200,
        alignItems: 'center',
        //margin: 10,
    },
    secondaryText: {
        color: '#053331',
        fontFamily: 'Poppins',
        fontSize: 16,
    },
    danger: {
        backgroundColor: 'rgba(145, 17, 17, 0.45)',
        borderColor: '#911111',
        borderWidth: 1,
        padding: 8,
        borderRadius: 10,
        //width: 200,
        alignItems: 'center',
        //margin: 10,
    },
    dangerText: {
        color: '#911111',
        fontFamily: 'Poppins',
        fontSize: 16,
    },
});

export default Button;