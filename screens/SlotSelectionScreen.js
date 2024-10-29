import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing Ionicons for icons

const SlotSelectionScreen = ({ navigation, route }) => {
  const { gym } = route.params;
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60); // Default duration
  const [selectedSlot, setSelectedSlot] = useState(null); // For storing selected slot
  const [isTimeDropdownVisible, setIsTimeDropdownVisible] = useState(false); // For showing/hiding time dropdown

  const durations = [60, 90, 120, 180];
  const availableSlots = gym.slots;

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

  const handleConfirm = () => {
    if (!selectedSlot) {
      Alert.alert("Please select a time.");
      return;
    }
    const slotDetails = {
      date: date.toLocaleDateString(),
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
    return timeString.replace(':00', ''); // Remove trailing ":00"
  };

  const buttonColor = '#28a745'; // Set uniform button color to green

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#333" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Gym Name */}
      <Text style={styles.gymName}>{gym.name}</Text>

      <Text style={styles.title}>Select a Slot</Text>

      {/* Date Picker */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={[styles.button, { backgroundColor: buttonColor }]}>
        <Icon name="calendar-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>{`Date: ${date.toLocaleDateString()}`}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()} // Prevent past dates
        />
      )}

      {/* Time Selection */}
      <Text style={styles.timeTitle}>Select Available Time:</Text>
      <TouchableOpacity
        onPress={() => setIsTimeDropdownVisible(!isTimeDropdownVisible)}
        style={[styles.button, { backgroundColor: buttonColor }]}>
        <Icon name="time-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>
          {selectedSlot ? formatTime(selectedSlot.startTime) : 'Select Time'}
        </Text>
      </TouchableOpacity>

      {isTimeDropdownVisible && (
        <View style={styles.timeDropdown}>
          {availableSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              onPress={() => {
                setSelectedSlot(slot);
                setIsTimeDropdownVisible(false); // Close dropdown on selection
              }}
              style={styles.timeOption}>
              <Text style={styles.timeOptionText}>
                {formatTime(slot.startTime)}
              </Text>
              <Text style={styles.slotDetailsText}>
                Price: ₹{slot.price}
              </Text>
            </TouchableOpacity>
          ))}
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
            ]}>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
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
    fontFamily: 'Roboto',
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
    fontFamily: 'Roboto',
    flex: 1,
  },
  icon: {
    marginRight: 10,
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
  timeOptionText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
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
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SlotSelectionScreen;
