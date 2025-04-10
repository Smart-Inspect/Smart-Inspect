import { ColorTypes, useColor } from '@/context/ColorContext';
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ButtonProps {
    variant: 'primary' | 'primary-outline' | 'secondary' | 'warning' | 'danger';
    text: string;
    onPress?: () => void;
    disabled?: boolean;
    style?: object;
}

const Button: React.FC<ButtonProps> = ({ variant, text, onPress, disabled, style }) => {
    const color = useColor();
    const styles = getStyles(color.getColors());

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
        case 'warning':
            buttonStyle = styles.warning;
            buttonStyleText = styles.warningText;
            break;
        case 'danger':
            buttonStyle = styles.danger;
            buttonStyleText = styles.dangerText;
            break;
        // Add more variants here
    }

    return (
        <TouchableOpacity style={[buttonStyle, style]} disabled={disabled} onPress={onPress}>
            <Text style={buttonStyleText}>{text}</Text>
        </TouchableOpacity>
    );
};

function getStyles(color: ColorTypes) {
    return StyleSheet.create({
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
            backgroundColor: color.buttonSecondary,
            borderColor: color.borderColor,
            borderWidth: 1,
            padding: 8,
            borderRadius: 10,
            //width: 200,
            alignItems: 'center',
            //margin: 10,
        },
        secondaryText: {
            color: color.textColor,
            fontFamily: 'Poppins',
            fontSize: 16,
        },
        warning: {
            backgroundColor: color.buttonWarning,
            borderColor: color.buttonWarning,
            borderWidth: 1,
            padding: 8,
            borderRadius: 10,
            //width: 200,
            alignItems: 'center',
            //margin: 10,
        },
        warningText: {
            color: color.textWarning,
            fontFamily: 'Poppins',
            fontSize: 16,
        },
        danger: {
            backgroundColor: color.buttonDanger,
            borderColor: color.borderDanger,
            borderWidth: 1,
            padding: 8,
            borderRadius: 10,
            //width: 200,
            alignItems: 'center',
            //margin: 10,
        },
        dangerText: {
            color: color.textDanger,
            fontFamily: 'Poppins',
            fontSize: 16,
        },
    });
}

export default Button;