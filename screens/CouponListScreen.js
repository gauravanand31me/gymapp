import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

export default function CouponListScreen({ navigation, route }) {
  const { couponCode, slotDetails,  requestId} = route.params;

  const applyCoupon = (couponCodeData) => {
    Alert.alert('Coupon Applied', `Code "${couponCodeData.coupon_code}" has been applied!`);
    navigation.navigate('PaymentScreen', { selectedCoupon: couponCodeData, slotDetails,  requestId});
  };

  const renderCoupon = ({ item }) => {
    const description =
      item.discount_type === 'cash'
        ? `Get ₹${parseFloat(item.discount_amount)} off your purchase.`
        : `Save ${parseFloat(item.discount_amount)}% on your purchase.`;

    return (
      <View style={styles.card}>
        <Text style={styles.code}>{item.coupon_code}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => applyCoupon(item)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#2E7D32" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Available Coupons</Text>
      </View>

      {couponCode && couponCode.length > 0 ? (
        <FlatList
          data={couponCode}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderCoupon}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No coupon found...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    marginLeft: 6,
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  code: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});
