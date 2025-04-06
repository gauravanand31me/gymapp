import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CouponSection({ couponCode, onCouponChange, onApplyCoupon, onNavigateToCouponList }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Have a Coupon?</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Enter coupon code"
          placeholderTextColor="#aaa"
          value={couponCode}
          onChangeText={onCouponChange}
        />
        <TouchableOpacity style={styles.applyButton} onPress={onApplyCoupon}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onNavigateToCouponList}>
        <Text style={styles.browse}>Browse available coupons</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#2E7D32',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  browse: {
    marginTop: 10,
    fontSize: 15,
    textDecorationLine: 'underline',
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});
