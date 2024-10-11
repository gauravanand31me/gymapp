import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { createBookingUrl } from '../api/apiService';

const BookingQRCode = ({ booking_id, booking_date, booking_time, type  }) => {
 
  
  const qrCodeValue = createBookingUrl(booking_id);
  

  return (
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <Text>Your Booking QR Code:</Text>
      <QRCode value={qrCodeValue} size={200} />
    </View>
  );
};

export default BookingQRCode;
