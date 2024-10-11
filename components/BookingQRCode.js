import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const BookingQRCode = ({ booking_id, booking_date, booking_time, type  }) => {
 
  let qrCodeValue;

  if (type === 'daily') {
    qrCodeValue = JSON.stringify({
      booking_id,
      booking_date,
      booking_time,
    });
  } else {
    qrCodeValue = JSON.stringify({
      booking_id,
      booking_date,
    });
  }

  return (
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <Text>Your Booking QR Code:</Text>
      <QRCode value={qrCodeValue} size={200} />
    </View>
  );
};

export default BookingQRCode;
