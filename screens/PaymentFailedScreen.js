import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentFailedScreen = () => {
    const navigation = useNavigation();

    const handleRetry = () => {
        // You can customize this action, e.g., navigate back to the payment screen
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Image 
                source={require('../assets/paymentFailed.png')} // Add a relevant icon to indicate failure
                style={styles.icon}
            />
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.message}>
                Oops! Something went wrong with your payment. Please try again.
            </Text>
            <Button 
                title="Try Again"
                onPress={handleRetry}
                color="#FF4C4C" // Customize color to match your theme
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    icon: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF4C4C',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default PaymentFailedScreen;
