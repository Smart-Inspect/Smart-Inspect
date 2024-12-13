import { ColorTypes, useColor } from '@/context/ColorContext';
import { Modal, StyleSheet, View, TouchableWithoutFeedback } from 'react-native';

interface ModalProps {
    animationType: 'none' | 'slide' | 'fade';
    transparent: boolean;
    visible: boolean;
    onRequestClose: () => void;
    children: React.ReactNode;
}

const Popup: React.FC<ModalProps> = ({ animationType, transparent, visible, onRequestClose, children }) => {
    const color = useColor();
    const styles = getStyles(color.getColors());

    const closeModal = () => {
        onRequestClose();
    }

    return (
        <Modal
            animationType={animationType}
            transparent={transparent}
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <TouchableWithoutFeedback onPress={closeModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

function getStyles(color: ColorTypes) {
    return StyleSheet.create({
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        },
        modalContent: {
            backgroundColor: color.foreground,
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
        }
    });
}

export default Popup;