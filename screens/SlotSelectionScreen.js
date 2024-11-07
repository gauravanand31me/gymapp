import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';

const SlotSelectionScreen = ({ navigation, route }) => {
  const { gym } = route.params;
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isTimeDropdownVisible, setIsTimeDropdownVisible] = useState(false);

  const durations = [60, 90, 120, 180];
  const availableSlots = gym.slots;

  // Sort slots by time
  availableSlots.sort((a, b) => {
    const timeA = new Date(`1970-01-01T${a.startTime}`);
    const timeB = new Date(`1970-01-01T${b.startTime}`);
    return timeA - timeB;
  });

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
  };

  // Check if slot is in the past
  const isPastSlot = (slotTime) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    if (selectedDate.toDateString() !== currentDate.toDateString()) return false;

    const slotDateTime = new Date(`${selectedDate.toDateString()} ${slotTime}`);
    return slotDateTime < currentDate;
  };

  const handleConfirm = () => {
    if (!selectedSlot) {
      Alert.alert("Please select a time.");
      return;
    }
    const slotDetails = {
      date: formatDate(date),
      time: selectedSlot.startTime,
      duration: selectedDuration,
      gymName: gym.name,
      gymId: gym.id,
      price: selectedSlot.price,
      slotId: selectedSlot.id,
      pricePerSlot: selectedSlot.price,
      subscriptionId: gym?.subscriptions[0].id,
    };
    navigation.navigate('PaymentScreen', { slotDetails });
  };

  const formatTime = (timeString) => {
    return timeString.replace(':00', '');
  };

  const buttonColor = '#28a745';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon2 name="chevron-left" size={24} color="#808080" />
      </TouchableOpacity>

      {/* Gym Name */}
      <Text style={styles.gymName}>{gym.name}</Text>

      <Text style={styles.title}>Select a Slot</Text>

      {/* Date Picker */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={[styles.button, { backgroundColor: buttonColor }]}
      >
        <Icon name="calendar-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>{`Date: ${formatDate(date)}`}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Selection */}
      <Text style={styles.timeTitle}>Select Available Time:</Text>
      <TouchableOpacity
        onPress={() => setIsTimeDropdownVisible(!isTimeDropdownVisible)}
        style={[styles.button, { backgroundColor: buttonColor }]}
      >
        <Icon name="time-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>
          {selectedSlot ? formatTime(selectedSlot.startTime) : 'Select Time'}
        </Text>
      </TouchableOpacity>

      {isTimeDropdownVisible && (
        <View style={styles.timeDropdown}>
          {availableSlots.map((slot) => {
            const pastSlot = isPastSlot(slot.startTime);
            return (
              <TouchableOpacity
                key={slot.id}
                onPress={() => {
                  if (!pastSlot) {
                    setSelectedSlot(slot);
                    setIsTimeDropdownVisible(false);
                  }
                }}
                style={[styles.timeOption, pastSlot && styles.disabledTimeOption]}
                disabled={pastSlot}
              >
                <Text style={[styles.timeOptionText, pastSlot && styles.disabledText]}>
                  {formatTime(slot.startTime)}
                </Text>
                <Text style={[styles.slotDetailsText, pastSlot && styles.disabledText]}>
                  Price: ₹{slot.price}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Duration Selection */}
      <Text style={styles.durationTitle}>Select Duration in minutes:</Text>
      <View style={styles.durationsContainer}>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration}
            onPress={() => setSelectedDuration(duration)}
            style={[
              styles.durationButton,
              selectedDuration === duration && styles.selectedDurationButton,
            ]}
          >
            <Text style={[styles.durationText, { color: selectedDuration === duration ? '#fff' : '#333' }]}>
              {duration}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectedDuration}>{`Selected Duration in minutes: ${selectedDuration} min`}</Text>

      {/* Confirm Button */}
      <TouchableOpacity onPress={handleConfirm} style={[styles.button, { backgroundColor: buttonColor }]}>
        <Text style={styles.buttonText}>Confirm Slot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginTop: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginLeft: 10,
    flex: 1,
  },
  timeTitle: {
    color: '#333',
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  timeDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#28a745',
    padding: 10,
    elevation: 2,
  },
  timeOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  disabledTimeOption: {
    opacity: 0.5,
  },
  timeOptionText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
  },
  disabledText: {
    color: '#aaa',
  },
  slotDetailsText: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  durationTitle: {
    color: '#333',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  durationsContainer: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  durationButton: {
    width: 70,
    padding: 10,
    borderWidth: 2,
    borderColor: '#28a745',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  selectedDurationButton: {
    backgroundColor: '#28a745',
  },
  durationText: {
    fontSize: 16,
  },
  selectedDuration: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
});

export default SlotSelectionScreen;
